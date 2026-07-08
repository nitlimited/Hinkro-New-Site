import { useEffect, useMemo, useState } from "react";
import { defaultBlogPosts } from "./blogArchive";
import { storeCategories, storeProducts } from "./storeProducts";
import { supabase, isSupabaseConfigured } from "./portal/lib/supabaseClient";

function normalizeProduct(row) {
  const images = (row.images ?? []).sort((a, b) => a.position - b.position);
  const variations = row.variations ?? [];
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    slug: row.slug,
    path: `/product/${row.slug}/`,
    sourceUrl: row.sourceUrl ?? "",
    categories: row.categories ?? [],
    tags: row.tags ?? [],
    colors: row.colors ?? [],
    isAccessory: row.is_accessory,
    isFeatured: row.is_featured,
    stockText: row.stock_text,
    prices: row.prices ?? {},
    images: images.map((image) => ({
      src: image.src,
      alt: image.alt || row.name,
      source: image.src,
      role: image.role,
    })),
    variations: variations.map((variation) => ({
      attributes: variation.attributes ?? {},
      prices: variation.prices ?? {},
    })),
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    seo: row.seo ?? {},
  };
}

export function usePublicCatalog() {
  const [products, setProducts] = useState(storeProducts);
  const [loadedFromDatabase, setLoadedFromDatabase] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    supabase
      .from("products")
      .select("*, images:product_images(*), variations:product_variations(*)")
      .eq("status", "published")
      .order("sort")
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        setProducts(data.map(normalizeProduct));
        setLoadedFromDatabase(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.flatMap((product) => product.categories ?? []));
    return Array.from(unique);
  }, [products]);

  return {
    products,
    categories: categories.length > 0 ? categories : storeCategories,
    loadedFromDatabase,
  };
}

export function usePublicBlogPosts() {
  const [posts, setPosts] = useState(defaultBlogPosts);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
      .order("publish_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setPosts(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return posts;
}
