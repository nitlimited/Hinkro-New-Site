import { useEffect, useMemo, useState } from "react";

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
  const [products, setProducts] = useState([]);
  const [fallbackCategories, setFallbackCategories] = useState([]);
  const [loadedFromDatabase, setLoadedFromDatabase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      const { storeCategories, storeProducts } = await import("./storeProducts");
      if (cancelled) return;
      setProducts(storeProducts);
      setFallbackCategories(storeCategories);

      const { supabase, isSupabaseConfigured } = await import("./portal/lib/supabaseClient");
      if (!isSupabaseConfigured || !supabase) return;
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*), variations:product_variations(*)")
        .eq("status", "published")
        .order("sort");
      if (cancelled || error || !data || data.length === 0) return;
      setProducts(data.map(normalizeProduct));
      setLoadedFromDatabase(true);
    }

    loadCatalog();
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
    categories: categories.length > 0 ? categories : fallbackCategories,
    loadedFromDatabase,
  };
}

export function usePublicBlogPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      const { defaultBlogPosts } = await import("./blogArchive");
      if (cancelled) return;
      setPosts(defaultBlogPosts);

      const { supabase, isSupabaseConfigured } = await import("./portal/lib/supabaseClient");
      if (!isSupabaseConfigured || !supabase) return;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
        .order("publish_at", { ascending: false });
      if (cancelled || error || !data || data.length === 0) return;

      const postsBySlug = new Map(defaultBlogPosts.map((post) => [post.slug, post]));
      data.forEach((post) => {
        const fallbackPost = postsBySlug.get(post.slug);
        postsBySlug.set(post.slug, {
          ...fallbackPost,
          ...post,
          content: post.content || fallbackPost?.content || null,
        });
      });

      setPosts(
        Array.from(postsBySlug.values()).sort((a, b) =>
          (b.publish_at ?? "").localeCompare(a.publish_at ?? ""),
        ),
      );
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  return posts;
}
