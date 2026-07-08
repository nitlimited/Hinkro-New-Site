import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const source = fs.readFileSync(path.join(root, "src/storeProducts.js"), "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  source
    .replace("export const WHATSAPP_ORDER_NUMBER", "const WHATSAPP_ORDER_NUMBER")
    .replace("export const storeProducts", "const storeProducts")
    .replace("export const storeCategories", "const storeCategories")
    .concat("\nthis.storeProducts = storeProducts; this.storeCategories = storeCategories;"),
  sandbox,
);

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this import.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slugify = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

for (const [index, product] of sandbox.storeProducts.entries()) {
  const { data, error } = await supabase
    .from("products")
    .upsert(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type,
        categories: product.categories ?? [],
        tags: product.tags ?? [],
        colors: product.colors ?? [],
        is_accessory: product.isAccessory ?? false,
        is_featured: product.isFeatured ?? false,
        stock_text: product.stockText || "In stock",
        prices: product.prices ?? {},
        short_description: product.shortDescription || null,
        description: product.description || null,
        seo: product.seo ?? {},
        status: "published",
        sort: index,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("product_images").delete().eq("product_id", data.id);
  if (product.images?.length) {
    const { error: imageError } = await supabase.from("product_images").insert(
        product.images.map((image, imageIndex) => ({
          product_id: data.id,
          src: image.src,
          alt: image.alt || product.name,
          position: imageIndex,
          role: imageIndex === 0 ? "primary" : "gallery",
        })),
    );
    if (imageError) throw imageError;
  }

  await supabase.from("product_variations").delete().eq("product_id", data.id);
  if (product.variations?.length) {
    const { error: variationError } = await supabase.from("product_variations").insert(
      product.variations.map((variation) => ({
        product_id: data.id,
        attributes: { name: variation.name, option: variation.option },
        prices: {
          ghana: {
            min: variation.priceGhs ?? null,
            max: variation.priceGhs ?? null,
            currency: "GHS",
          },
          international: {
            min: variation.priceUsd ?? null,
            max: variation.priceUsd ?? null,
            currency: "USD",
          },
        },
      })),
    );
    if (variationError) throw variationError;
  }
}

for (const [position, name] of sandbox.storeCategories.entries()) {
  const { error } = await supabase.from("categories").upsert(
    {
      name,
      slug: slugify(name),
      kind: name === "Accessories" ? "accessory" : "product",
      position,
    },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

await supabase.from("categories").upsert(
  { name: "Trends & News", slug: "trends-news", kind: "blog", position: 0 },
  { onConflict: "slug" },
);

console.log(`Imported ${sandbox.storeProducts.length} products and ${sandbox.storeCategories.length + 1} categories.`);
