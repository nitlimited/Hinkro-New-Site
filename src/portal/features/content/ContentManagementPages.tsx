import React, { useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Eye,
  FileText,
  Image,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import RichTextEditor from "../../components/RichTextEditor";
import {
  addLibraryAsset,
  deleteBlogPost,
  deleteCategory,
  deleteLibraryAsset,
  deleteProduct,
  saveBlogPost,
  saveCategory,
  saveProduct,
  updateLibraryAsset,
  useBlogPosts,
  useCatalogProducts,
  useCategories,
  useLibraryAssets,
} from "../../lib/data";
import type {
  BlogPostRow,
  CategoryKind,
  CategoryRow,
  LibraryAssetRow,
  ProductImageRow,
  ProductRow,
  ProductVariationRow,
  PublishStatus,
} from "../../lib/rows";
import { EmptyState, Field, Modal, formatDate } from "../../components/ui";
import { SeoPanel, SeoScoreChip } from "../../components/SeoPanel";
import { analyzeSeo, type SchemaType } from "../../lib/seo";

/** Compute the stored score for list rows (uses saved fields only). */
function productSeoScore(p: ProductRow): number {
  return analyzeSeo({
    focusKeyword: String(p.seo?.focus_keyword ?? ""),
    seoTitle: String(p.seo?.title ?? ""),
    seoDescription: String(p.seo?.description ?? ""),
    urlPath: publicProductPath(p.slug),
    content: `${p.short_description ?? ""}\n\n${p.description ?? ""}`,
    imageAlts: (p.images ?? []).map((i) => i.alt ?? ""),
    usedKeywords: [],
  }).score;
}

function blogSeoScore(p: BlogPostRow): number {
  return analyzeSeo({
    focusKeyword: String(p.seo?.focus_keyword ?? ""),
    seoTitle: String(p.seo?.title ?? ""),
    seoDescription: String(p.seo?.description ?? ""),
    urlPath: `/blog/${p.slug}/`,
    content: p.content ?? "",
    imageAlts: p.featured_image ? [p.title] : [],
    usedKeywords: [],
  }).score;
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const publicProductPath = (slug: string) => `/product/${slug}/`;
const publicBlogPath = () => "/#blog";
const publicCategoryPath = (kind: CategoryKind) =>
  kind === "blog" ? "/#blog" : kind === "accessory" ? "/#accessories" : "/#store";

function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="portal-page-head">
      <div>
        <h1 className="portal-page-title">{title}</h1>
        <p className="portal-page-sub">{sub}</p>
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: PublishStatus }) {
  return <span className={`portal-status portal-status-${status}`}>{status}</span>;
}

function PublishConfirm({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      className="portal-btn-primary portal-btn-sm"
      type="button"
      onClick={() => {
        if (armed) onConfirm();
        else setArmed(true);
      }}
    >
      <Check size={15} /> {armed ? `Confirm ${label}` : label}
    </button>
  );
}

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="portal-pagination" aria-label="Pagination">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <button
          type="button"
          key={item}
          className={item === page ? "is-active" : ""}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  );
}

function ProductEditor({
  product,
  isAccessory,
  onClose,
  usedKeywords = [],
}: {
  product?: ProductRow;
  isAccessory: boolean;
  onClose: () => void;
  usedKeywords?: string[];
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categories, setCategories] = useState((product?.categories ?? []).join(", "));
  const [colors, setColors] = useState((product?.colors ?? []).join(", "));
  const [stock, setStock] = useState(product?.stock_text ?? "In stock");
  const [ghs, setGhs] = useState(String((product?.prices?.ghana as { min?: number } | undefined)?.min ?? ""));
  const [usd, setUsd] = useState(String((product?.prices?.international as { min?: number } | undefined)?.min ?? ""));
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [seoTitle, setSeoTitle] = useState(String(product?.seo?.title ?? ""));
  const [seoDescription, setSeoDescription] = useState(String(product?.seo?.description ?? ""));
  const [focusKeyword, setFocusKeyword] = useState(String(product?.seo?.focus_keyword ?? ""));
  const [schemaType, setSchemaType] = useState<SchemaType>(
    (product?.seo?.schema_type as SchemaType) ?? "Product",
  );
  const [status, setStatus] = useState<PublishStatus>(product?.status ?? "draft");
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [images, setImages] = useState<ProductImageRow[]>(
    product?.images?.length
      ? product.images
      : [{
          id: "new-image-1",
          product_id: product?.id ?? 0,
          src: "",
          alt: product?.name ?? "",
          position: 0,
          role: "primary",
        }],
  );
  const [variations, setVariations] = useState<ProductVariationRow[]>(
    product?.variations?.length
      ? product.variations
      : [],
  );
  const [saving, setSaving] = useState(false);

  const updateImage = (index: number, patch: Partial<ProductImageRow>) => {
    setImages((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch, position: rowIndex } : row,
      ),
    );
  };

  const addImage = (role: ProductImageRow["role"] = "gallery") => {
    setImages((rows) => [
      ...rows,
      {
        id: `new-image-${rows.length + 1}`,
        product_id: product?.id ?? 0,
        src: "",
        alt: name,
        position: rows.length,
        role,
      },
    ]);
  };

  const updateVariation = (
    index: number,
    patch: { option?: string; ghs?: string; usd?: string },
  ) => {
    setVariations((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const currentGhs = (row.prices?.ghana as { min?: number | null } | undefined)?.min;
        const currentUsd = (row.prices?.international as { min?: number | null } | undefined)?.min;
        const nextGhs = patch.ghs !== undefined ? patch.ghs : String(currentGhs ?? "");
        const nextUsd = patch.usd !== undefined ? patch.usd : String(currentUsd ?? "");
        return {
          ...row,
          attributes: {
            ...row.attributes,
            option: patch.option ?? String(row.attributes?.option ?? ""),
          },
          prices: {
            ghana: { min: nextGhs ? Number(nextGhs) : null, max: nextGhs ? Number(nextGhs) : null, currency: "GHS" },
            international: { min: nextUsd ? Number(nextUsd) : null, max: nextUsd ? Number(nextUsd) : null, currency: "USD" },
          },
        };
      }),
    );
  };

  const addVariation = () => {
    setVariations((rows) => [
      ...rows,
      {
        id: `new-variation-${rows.length + 1}`,
        product_id: product?.id ?? 0,
        attributes: { option: "" },
        prices: {
          ghana: { min: null, max: null, currency: "GHS" },
          international: { min: null, max: null, currency: "USD" },
        },
      },
    ]);
  };

  const submit = async (nextStatus = status) => {
    setSaving(true);
    await saveProduct({
      ...product,
      name,
      slug: slug || slugify(name),
      is_accessory: isAccessory,
      categories: categories.split(",").map((x) => x.trim()).filter(Boolean),
      colors: colors.split(",").map((x) => x.trim()).filter(Boolean),
      stock_text: stock,
      is_featured: featured,
      status: nextStatus,
      prices: {
        ghana: { min: ghs ? Number(ghs) : null, max: ghs ? Number(ghs) : null, currency: "GHS" },
        international: { min: usd ? Number(usd) : null, max: usd ? Number(usd) : null, currency: "USD" },
      },
      short_description: shortDescription,
      description,
      seo: {
        title: seoTitle,
        description: seoDescription,
        focus_keyword: focusKeyword,
        schema_type: schemaType,
      },
      images: images
        .filter((image) => image.src.trim())
        .map((image, index) => ({ ...image, position: index })),
      variations,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal title={product ? "Edit product" : "New product"} onClose={onClose}>
      <form className="portal-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <div className="portal-form-row">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} /></Field>
        </div>
        <div className="portal-form-row">
          <Field label="Categories"><input value={categories} onChange={(e) => setCategories(e.target.value)} /></Field>
          <Field label="Colours"><input value={colors} onChange={(e) => setColors(e.target.value)} /></Field>
        </div>
        <div className="portal-form-row">
          <Field label="GHS price"><input type="number" value={ghs} onChange={(e) => setGhs(e.target.value)} /></Field>
          <Field label="USD price"><input type="number" value={usd} onChange={(e) => setUsd(e.target.value)} /></Field>
          <Field label="Stock"><input value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
        </div>
        <Field label="Short description">
          <RichTextEditor
            value={shortDescription}
            onChange={setShortDescription}
            placeholder="Brief product summary..."
            minHeight="120px"
          />
        </Field>
        <Field label="Description">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Detailed product description..."
            minHeight="250px"
          />
        </Field>
        <section className="portal-editor-panel">
          <div className="portal-editor-panel-head">
            <h3>Product images</h3>
            <button className="portal-btn-secondary" type="button" onClick={() => addImage("gallery")}><Plus size={15} /> Add gallery image</button>
          </div>
          <div className="portal-image-editor-list">
            {images.map((image, index) => (
              <div className="portal-image-editor-row" key={image.id}>
                {image.src ? <img src={image.src} alt="" /> : <div className="portal-image-placeholder"><Image size={20} /></div>}
                <Field label="Image URL"><input value={image.src} onChange={(e) => updateImage(index, { src: e.target.value })} placeholder="/images/store/product.jpg" /></Field>
                <Field label="Alt text"><input value={image.alt ?? ""} onChange={(e) => updateImage(index, { alt: e.target.value })} /></Field>
                <Field label="Role">
                  <select value={image.role ?? (index === 0 ? "primary" : "gallery")} onChange={(e) => updateImage(index, { role: e.target.value as ProductImageRow["role"] })}>
                    <option value="primary">Primary</option>
                    <option value="gallery">Gallery</option>
                    {isAccessory && <option value="hover">Accessory hover</option>}
                  </select>
                </Field>
                <button className="portal-icon-btn" type="button" aria-label="Remove image" onClick={() => setImages((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}>×</button>
              </div>
            ))}
          </div>
        </section>
        <section className="portal-editor-panel">
          <div className="portal-editor-panel-head">
            <h3>Variations</h3>
            <button className="portal-btn-secondary" type="button" onClick={addVariation}><Plus size={15} /> Add variation</button>
          </div>
          <div className="portal-variation-list">
            {variations.length === 0 && <p className="portal-muted-inline">No variations yet.</p>}
            {variations.map((variation, index) => {
              const variationGhs = (variation.prices?.ghana as { min?: number | null } | undefined)?.min;
              const variationUsd = (variation.prices?.international as { min?: number | null } | undefined)?.min;
              return (
                <div className="portal-variation-row" key={variation.id}>
                  <Field label="Option"><input value={String(variation.attributes?.option ?? "")} onChange={(e) => updateVariation(index, { option: e.target.value })} placeholder="Size, colour, package" /></Field>
                  <Field label="GHS"><input type="number" value={String(variationGhs ?? "")} onChange={(e) => updateVariation(index, { ghs: e.target.value })} /></Field>
                  <Field label="USD"><input type="number" value={String(variationUsd ?? "")} onChange={(e) => updateVariation(index, { usd: e.target.value })} /></Field>
                  <button className="portal-icon-btn" type="button" aria-label="Remove variation" onClick={() => setVariations((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}>×</button>
                </div>
              );
            })}
          </div>
        </section>
        <div className="portal-form-row">
          <Field label="SEO title"><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></Field>
          <Field label="SEO description"><input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></Field>
        </div>
        <SeoPanel
          focusKeyword={focusKeyword}
          onFocusKeywordChange={setFocusKeyword}
          schemaType={schemaType}
          onSchemaTypeChange={setSchemaType}
          input={{
            seoTitle,
            seoDescription,
            urlPath: publicProductPath(slug || slugify(name)),
            content: `${shortDescription}\n\n${description}`,
            imageAlts: images.map((i) => i.alt ?? ""),
            usedKeywords,
          }}
          schemaFields={{
            name,
            description: seoDescription || shortDescription,
            url: publicProductPath(slug || slugify(name)),
            image: images[0]?.src || undefined,
            priceGhs: ghs ? Number(ghs) : null,
            priceUsd: usd ? Number(usd) : null,
          }}
        />
        <div className="portal-form-row">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as PublishStatus)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <label className="portal-check"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured product</label>
        </div>
        <div className="portal-actions">
          <button className="portal-btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="portal-btn-primary portal-btn-sm" disabled={saving} type="submit">Save draft</button>
          {status !== "published" && <PublishConfirm label="Publish" onConfirm={() => void submit("published")} />}
        </div>
      </form>
    </Modal>
  );
}

export function ProductsPage({ accessories = false }: { accessories?: boolean }) {
  const { products, loading } = useCatalogProducts({ accessories });
  const { categories } = useCategories(accessories ? "accessory" : "product");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesQuery = `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "All" || p.categories.includes(category);
        return matchesQuery && matchesCategory;
      }),
    [category, products, query],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pagedProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  React.useEffect(() => {
    setPage(1);
  }, [category, itemsPerPage, query]);

  const removeProduct = async (product: ProductRow) => {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    await deleteProduct(product.id);
  };

  return (
    <section>
      <PageHead
        title={accessories ? "Accessories" : "Products"}
        sub={accessories ? "Manage accessory listings that feed the public Accessories page." : "Manage the public store catalog, pricing, SEO, and publish state."}
        action={<button className="portal-btn-primary portal-btn-sm" onClick={() => setEditing("new")}><Plus size={15} /> New</button>}
      />
      <div className="portal-toolbar">
        <label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search catalog" /></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {categories.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={40}>40 per page</option>
          <option value={filtered.length || 1}>All</option>
        </select>
      </div>
      {!loading && filtered.length === 0 ? <EmptyState title="No listings found" body="Create a listing or adjust the filter." /> : (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead><tr><th>Image</th><th>Listing</th><th>Category</th><th>Price</th><th>SEO</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {pagedProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="portal-product-thumb">
                      {p.images?.[0]?.src ? <img src={p.images[0].src} alt="" /> : <Image size={18} />}
                    </div>
                  </td>
                  <td><strong>{p.name}</strong><span className="portal-muted-line">{p.slug}</span></td>
                  <td>{p.categories.slice(0, 2).join(", ") || "-"}</td>
                  <td>{String((p.prices?.ghana as { min?: number } | undefined)?.min ?? "-")} GHS / {String((p.prices?.international as { min?: number } | undefined)?.min ?? "-")} USD</td>
                  <td><SeoScoreChip score={productSeoScore(p)} /></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.is_featured ? "Yes" : "No"}</td>
                  <td>
                    <div className="portal-row-actions">
                      <button className="portal-icon-btn" type="button" aria-label="Edit" title="Edit" onClick={() => setEditing(p)}><Edit3 size={16} /></button>
                      <a className="portal-icon-btn" aria-label="Preview" title="Preview" href={publicProductPath(p.slug)} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                      <button className="portal-icon-btn portal-icon-danger" type="button" aria-label="Delete" title="Delete" onClick={() => void removeProduct(p)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
      {editing && (
        <ProductEditor
          product={editing === "new" ? undefined : editing}
          isAccessory={accessories}
          onClose={() => setEditing(null)}
          usedKeywords={products
            .filter((p) => editing === "new" || p.id !== editing.id)
            .map((p) => String(p.seo?.focus_keyword ?? ""))
            .filter(Boolean)}
        />
      )}
    </section>
  );
}

function BlogEditor({
  post,
  onClose,
  usedKeywords = [],
}: {
  post?: BlogPostRow;
  onClose: () => void;
  usedKeywords?: string[];
}) {
  const { profile } = useAuth();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? "");
  const [status, setStatus] = useState<PublishStatus>(post?.status ?? "draft");
  const [publishAt, setPublishAt] = useState(post?.publish_at?.slice(0, 16) ?? "");
  const [seoTitle, setSeoTitle] = useState(String(post?.seo?.title ?? ""));
  const [seoDescription, setSeoDescription] = useState(String(post?.seo?.description ?? ""));
  const [focusKeyword, setFocusKeyword] = useState(String(post?.seo?.focus_keyword ?? ""));
  const [schemaType, setSchemaType] = useState<SchemaType>(
    (post?.seo?.schema_type as SchemaType) ?? "BlogPosting",
  );

  const submit = async (nextStatus = status) => {
    await saveBlogPost({
      ...post,
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      featured_image: featuredImage,
      status: nextStatus,
      publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      seo: {
        title: seoTitle,
        description: seoDescription,
        focus_keyword: focusKeyword,
        schema_type: schemaType,
      },
    }, profile?.id ?? "demo-user");
    onClose();
  };

  return (
    <Modal title={post ? "Edit post" : "New post"} onClose={onClose}>
      <form className="portal-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <div className="portal-form-row">
          <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
          <Field label="Slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(title)} /></Field>
        </div>
        <Field label="Excerpt"><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} /></Field>
        <Field label="Content">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your blog post content here..."
            minHeight="400px"
          />
        </Field>
        <Field label="Featured image"><input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="/images/..." /></Field>
        <div className="portal-form-row">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as PublishStatus)}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Publish at"><input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></Field>
        </div>
        <div className="portal-form-row">
          <Field label="SEO title"><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></Field>
          <Field label="SEO description"><input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></Field>
        </div>
        <SeoPanel
          focusKeyword={focusKeyword}
          onFocusKeywordChange={setFocusKeyword}
          schemaType={schemaType}
          onSchemaTypeChange={setSchemaType}
          input={{
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || excerpt,
            urlPath: `/blog/${slug || slugify(title)}/`,
            content,
            imageAlts: featuredImage ? [title] : [],
            usedKeywords,
          }}
          schemaFields={{
            name: seoTitle || title,
            description: seoDescription || excerpt,
            url: `/blog/${slug || slugify(title)}/`,
            image: featuredImage || undefined,
            author: "Hinkro Kente",
            datePublished: publishAt ? new Date(publishAt).toISOString() : undefined,
          }}
        />
        <div className="portal-actions">
          <button className="portal-btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="portal-btn-primary portal-btn-sm" type="submit">Save</button>
          {status !== "published" && <PublishConfirm label="Publish" onConfirm={() => void submit("published")} />}
        </div>
      </form>
    </Modal>
  );
}

export function BlogPage() {
  const { posts } = useBlogPosts();
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BlogPostRow | "new" | null>(null);
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const pagedPosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage);

  React.useEffect(() => {
    setPage(1);
  }, [posts.length, postsPerPage]);

  const removePost = async (post: BlogPostRow) => {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    await deleteBlogPost(post.id);
  };

  return (
    <section>
      <PageHead title="Blog" sub="Create Trends & News posts with SEO, scheduling, and publish review." action={<button className="portal-btn-primary portal-btn-sm" onClick={() => setEditing("new")}><Plus size={15} /> New post</button>} />
      <div className="portal-toolbar">
        <span className="portal-muted-inline">{posts.length} posts · page {page} of {totalPages}</span>
        <select value={postsPerPage} onChange={(e) => setPostsPerPage(Number(e.target.value))}>
          <option value={6}>6 per page</option>
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={posts.length || 1}>All</option>
        </select>
      </div>
      <div className="portal-card-grid">
        {pagedPosts.map((post) => (
          <article className="portal-card portal-content-card" key={post.id}>
            {post.featured_image && <img src={post.featured_image} alt="" />}
            <div><StatusBadge status={post.status} /><SeoScoreChip score={blogSeoScore(post)} /><span className="portal-muted-line">{formatDate(post.publish_at ?? post.created_at)}</span></div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="portal-card-actions">
              <button className="portal-btn-secondary" type="button" onClick={() => setEditing(post)}><Edit3 size={15} /> Edit</button>
              <a className="portal-btn-secondary" href={publicBlogPath()} target="_blank" rel="noreferrer"><Eye size={15} /> Preview</a>
              <button className="portal-btn-secondary portal-btn-danger" type="button" onClick={() => void removePost(post)}><Trash2 size={15} /> Delete</button>
            </div>
          </article>
        ))}
      </div>
      <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
      {editing && (
        <BlogEditor
          post={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          usedKeywords={posts
            .filter((p) => editing === "new" || p.id !== editing.id)
            .map((p) => String(p.seo?.focus_keyword ?? ""))
            .filter(Boolean)}
        />
      )}
    </section>
  );
}

export function MediaLibraryPage() {
  const { profile } = useAuth();
  const { assets } = useLibraryAssets();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("All");
  const [kind, setKind] = useState("All");
  const [sitemap, setSitemap] = useState("All");
  const [editing, setEditing] = useState<LibraryAssetRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const folders = ["All", ...Array.from(new Set(assets.map((a) => a.folder).filter(Boolean)))];
  const filtered = assets.filter((a) =>
    (folder === "All" || a.folder === folder) &&
    (kind === "All" || a.kind === kind) &&
    (sitemap === "All" ||
      (sitemap === "Included" && !a.exclude_from_sitemap) ||
      (sitemap === "Excluded" && a.exclude_from_sitemap)) &&
    `${a.title ?? ""} ${a.alt ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await addLibraryAsset({
      title: file.name,
      alt: file.name,
      folder: folder === "All" ? "Uploads" : folder,
      kind: file.type.startsWith("video") ? "video" : file.type.includes("pdf") ? "doc" : "image",
      file,
      uploaded_by: profile?.id,
    });
    setUploading(false);
    event.target.value = "";
  };

  const usage = assets.reduce((sum, asset) => sum + (asset.size_bytes ?? 0), 0);
  return (
    <section>
      <PageHead title="Media library" sub={`${assets.length} files · ${(usage / 1000000).toFixed(1)} MB tracked storage`} action={<label className="portal-btn-primary portal-btn-sm"><Upload size={15} /> {uploading ? "Uploading" : "Upload"}<input hidden type="file" onChange={onUpload} /></label>} />
      <div className="portal-toolbar">
        <label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media" /></label>
        <select value={folder} onChange={(e) => setFolder(e.target.value)}>{folders.map((f) => <option key={f}>{f}</option>)}</select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}><option>All</option><option value="image">Images</option><option value="video">Videos</option><option value="doc">Documents</option></select>
        <select value={sitemap} onChange={(e) => setSitemap(e.target.value)}><option>All</option><option>Included</option><option>Excluded</option></select>
      </div>
      <div className="portal-media-grid">
        {filtered.map((asset) => <MediaTile asset={asset} key={asset.id} onOpen={() => setEditing(asset)} />)}
      </div>
      {editing && <MediaEditor asset={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

function MediaTile({ asset, onOpen }: { asset: LibraryAssetRow; onOpen: () => void }) {
  return (
    <button className="portal-card portal-media-tile" type="button" onClick={onOpen}>
      {asset.kind === "image" && asset.url ? <img src={asset.url} alt={asset.alt ?? asset.title ?? ""} /> : <div className="portal-media-icon">{asset.kind === "video" ? <Eye size={28} /> : <FileText size={28} />}</div>}
      <h3>{asset.title ?? asset.storage_path}</h3>
      <p>{asset.folder || "Unfiled"} · {asset.kind}{asset.exclude_from_sitemap ? " · sitemap excluded" : ""}</p>
    </button>
  );
}

function MediaEditor({ asset, onClose }: { asset: LibraryAssetRow; onClose: () => void }) {
  const [title, setTitle] = useState(asset.title ?? "");
  const [alt, setAlt] = useState(asset.alt ?? "");
  const [caption, setCaption] = useState(asset.caption ?? "");
  const [description, setDescription] = useState(asset.description ?? "");
  const [folder, setFolder] = useState(asset.folder ?? "");
  const [exclude, setExclude] = useState(asset.exclude_from_sitemap ?? false);
  const fileUrl = asset.url ?? asset.storage_path;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateLibraryAsset(asset.id, {
      title,
      alt,
      caption,
      description,
      folder,
      exclude_from_sitemap: exclude,
    });
    onClose();
  };

  const deleteAsset = async () => {
    await deleteLibraryAsset(asset.id);
    onClose();
  };

  return (
    <Modal title="Attachment details" onClose={onClose}>
      <form className="portal-form portal-media-editor" onSubmit={submit}>
        <div className="portal-media-editor-layout">
          <div className="portal-attachment-preview">
            {asset.kind === "image" && fileUrl ? <img src={fileUrl} alt={alt || title} /> : <div className="portal-media-icon"><FileText size={34} /></div>}
            <div className="portal-attachment-links">
              <a href={fileUrl} target="_blank" rel="noreferrer">View attachment page</a>
              <a href={fileUrl} target="_blank" rel="noreferrer">Edit more details</a>
              <a href={fileUrl} download>Download file</a>
              <button type="button" onClick={deleteAsset}>Delete permanently</button>
            </div>
          </div>
          <div className="portal-attachment-fields">
            <Field label="Alternative text"><input value={alt} onChange={(e) => setAlt(e.target.value)} /></Field>
            <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Caption"><textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
            <Field label="Description"><textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <Field label="Folder"><input value={folder} onChange={(e) => setFolder(e.target.value)} /></Field>
            <Field label="File URL"><input value={fileUrl} readOnly /></Field>
            <label className="portal-check"><input type="checkbox" checked={exclude} onChange={(e) => setExclude(e.target.checked)} /> Exclude this attachment from sitemap</label>
          </div>
        </div>
        <div className="portal-actions">
          <button className="portal-btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="portal-btn-primary portal-btn-sm" type="submit">Save attachment</button>
        </div>
      </form>
    </Modal>
  );
}

export function CategoriesPage() {
  const { categories } = useCategories();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKind>("product");
  const [imageUrl, setImageUrl] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await saveCategory({
      ...editing,
      name,
      slug: editing?.slug ?? slugify(name),
      kind,
      position: editing?.position ?? categories.length,
      image_url: imageUrl || null,
    });
    setEditing(null);
    setName("");
    setImageUrl("");
  };

  const removeCategory = async (category: CategoryRow) => {
    if (!window.confirm(`Delete "${category.name}" permanently?`)) return;
    await deleteCategory(category.id);
  };

  return (
    <section>
      <PageHead title="Categories" sub="Shared category manager for store filters, accessories, and blog organization." />
      <form className="portal-card portal-inline-form" onSubmit={submit}>
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="Kind"><select value={kind} onChange={(e) => setKind(e.target.value as CategoryKind)}><option value="product">Product</option><option value="accessory">Accessory</option><option value="blog">Blog</option></select></Field>
        <Field label="Thumbnail URL"><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/category.jpg" /></Field>
        <button className="portal-btn-primary portal-btn-sm" type="submit"><Plus size={15} /> {editing ? "Update" : "Add"}</button>
      </form>
      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead><tr><th>Image</th><th>Position</th><th>Name</th><th>Kind</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>{categories.map((category) => (
            <tr key={category.id}>
              <td><div className="portal-product-thumb">{category.image_url ? <img src={category.image_url} alt="" /> : <Image size={18} />}</div></td><td>{category.position + 1}</td><td>{category.name}</td><td>{category.kind}</td><td>{category.slug}</td>
              <td>
                <div className="portal-row-actions">
                  <button className="portal-icon-btn" type="button" aria-label="Edit category" title="Edit" onClick={() => { setEditing(category); setName(category.name); setKind(category.kind); setImageUrl(category.image_url ?? ""); }}><Edit3 size={16} /></button>
                  <a className="portal-icon-btn" aria-label="Preview category" title="Preview" href={publicCategoryPath(category.kind)} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                  <button className="portal-icon-btn portal-icon-danger" type="button" aria-label="Delete category" title="Delete" onClick={() => void removeCategory(category)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
