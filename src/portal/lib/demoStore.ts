/**
 * In-memory sample database powering preview/demo mode. Mutations work, so
 * the whole core loop can be exercised before the real backend is connected.
 * State resets on page reload — by design.
 */

import type {
  BlogPostRow,
  CategoryRow,
  ClientRow,
  LibraryAssetRow,
  MediaRow,
  MessageRow,
  NotificationRow,
  ProfileRow,
  ProductRow,
  ProjectRow,
  StageRow,
  UpdateRow,
  WeaverProfileRow,
  WorkLogRow,
} from "./rows";
import { defaultBlogPosts } from "../../blogArchive";
import { storeCategories, storeProducts } from "../../storeProducts";

const now = Date.now();
const daysAgo = (d: number, h = 10) =>
  new Date(now - d * 86400000 - h * 3600000).toISOString();
const daysAhead = (d: number) =>
  new Date(now + d * 86400000).toISOString().slice(0, 10);

let seq = 100;
export const demoId = (prefix: string) => `${prefix}-${++seq}`;

/* ---------- fixtures ---------- */

export const demoStages: StageRow[] = [
  "Order Received",
  "Materials Prepared",
  "Loom Preparation",
  "Thread Setup",
  "Weaving Started",
  "Weaving in Progress",
  "Design Verification",
  "Embroidery",
  "Quality Inspection",
  "Finishing",
  "Packaging",
  "Ready for Delivery",
  "Completed",
].map((name, i) => ({
  id: `stage-${i + 1}`,
  name,
  position: i + 1,
  is_active: true,
}));

const stageId = (name: string) =>
  demoStages.find((s) => s.name === name)!.id;

export const demoProfiles: ProfileRow[] = [
  {
    id: "demo-user",
    full_name: "Demo User",
    email: "demo@hinkrokente.com",
    phone: null,
    role: "admin",
    status: "active",
    created_at: daysAgo(60),
  },
  {
    id: "weaver-1",
    full_name: "Kwabena Owusu",
    email: "kwabena@hinkrokente.com",
    phone: "+233 20 111 2222",
    role: "weaver",
    status: "active",
    created_at: daysAgo(50),
  },
  {
    id: "weaver-2",
    full_name: "Yaw Asare",
    email: "yaw@hinkrokente.com",
    phone: "+233 24 333 4444",
    role: "weaver",
    status: "active",
    created_at: daysAgo(48),
  },
  {
    id: "client-1",
    full_name: "Deborah Adjei",
    email: "deborah@example.com",
    phone: "+233 55 555 6666",
    role: "client",
    status: "active",
    created_at: daysAgo(12),
  },
];

export const demoWeaverProfiles: WeaverProfileRow[] = [
  {
    profile_id: "weaver-1",
    years_experience: 14,
    specialties: ["Adweneasa", "Bridal Kente", "Ombre / Transition"],
    bio: "Master weaver from Bonwire with a passion for intricate Adweneasa borders and bridal commissions.",
    portrait_url: "/images/hinkro-kente-eric-boafo-asante-ceo.jpg",
    hometown: "Bonwire, Ashanti Region",
    languages: ["Twi", "English"],
    address: "House 14, Weavers Lane, Bonwire",
    id_number: "GHA-0912-2288-1",
    emergency_contact: "Akosua Owusu · +233 20 999 0001",
    profile: {
      full_name: "Kwabena Owusu",
      email: "kwabena@hinkrokente.com",
      phone: "+233 20 111 2222",
      status: "active",
    },
  },
  {
    profile_id: "weaver-2",
    years_experience: 8,
    specialties: ["Plain Weave", "Graduation Stoles", "Shimmer Kente"],
    bio: "Detail-focused weaver specialising in clean plain weaves and personalised graduation stoles.",
    portrait_url: "/images/graduation-stole/kente-graduation-stole-jeffery-suit.jpg",
    hometown: "Adanwomase, Ashanti Region",
    languages: ["Twi", "English", "Ga"],
    address: "Plot 7, Adanwomase",
    id_number: "GHA-0714-9931-4",
    emergency_contact: "Yaa Asantewaa · +233 24 555 0002",
    profile: {
      full_name: "Yaw Asare",
      email: "yaw@hinkrokente.com",
      phone: "+233 24 333 4444",
      status: "active",
    },
  },
];

export const demoClients: ClientRow[] = [
  {
    id: "cl-1",
    profile_id: "client-1",
    name: "Deborah Adjei",
    email: "deborah@example.com",
    phone: "+233 55 555 6666",
    country: "Ghana",
    notes: "Wedding in late July — colours must match the invitation suite.",
    created_at: daysAgo(12),
  },
  {
    id: "cl-2",
    profile_id: null,
    name: "Jeffery Boateng",
    email: "jeffery@example.com",
    phone: null,
    country: "United Kingdom",
    notes: null,
    created_at: daysAgo(9),
  },
  {
    id: "cl-3",
    profile_id: null,
    name: "Nana Akoto",
    email: "nana@example.com",
    phone: "+233 27 777 8888",
    country: "Ghana",
    notes: "Koforidua Technical University — batch order contact.",
    created_at: daysAgo(20),
  },
];

export const demoProjects: ProjectRow[] = [
  {
    id: "pr-1",
    reference: "HK-2026-0041",
    title: "Wedding Kente — gold & royal blue",
    client_id: "cl-1",
    weaver_id: "weaver-1",
    pattern: "Adweneasa",
    measurements: { note: "12 yards, standard adult width" },
    thread_colors: ["Gold", "Royal Blue", "Ivory"],
    accessories: ["Bridal hand fan", "Garment bag"],
    quantity: 1,
    priority: "high",
    current_stage_id: stageId("Weaving in Progress"),
    progress_pct: 65,
    est_start: daysAgo(7).slice(0, 10),
    est_completion: daysAhead(16),
    actual_completion: null,
    design_notes:
      "Client wants the Adweneasa motif dense at the borders, lighter toward the centre panels.",
    spec: {
      design_yards: 4,
      plain_yards: 2,
      gender: "woman",
      garment_type: "3_pieces",
      has_border: true,
      has_shimmers: true,
      thread_type: "silk",
      is_ombre: false,
      ombre_colors: [],
      has_embroidery: false,
    },
    approvals: {
      thread: "approved",
      thread_at: daysAgo(9),
      pattern: "approved",
      pattern_at: daysAgo(8),
    },
    delivery_status: "pending",
    payment_status: "partial",
    is_paused: false,
    created_at: daysAgo(12),
    updated_at: daysAgo(0, 2),
  },
  {
    id: "pr-2",
    reference: "HK-2026-0042",
    title: "Engagement Kente — emerald & silver",
    client_id: "cl-2",
    weaver_id: "weaver-2",
    pattern: "Sika Futuro",
    measurements: { note: "8 yards" },
    thread_colors: ["Emerald", "Silver", "White"],
    accessories: [],
    quantity: 1,
    priority: "normal",
    current_stage_id: stageId("Thread Setup"),
    progress_pct: 20,
    est_start: daysAgo(4).slice(0, 10),
    est_completion: daysAhead(25),
    actual_completion: null,
    design_notes: null,
    spec: {
      design_yards: 4,
      plain_yards: 2,
      gender: "woman",
      garment_type: "dansikran",
      has_border: false,
      has_shimmers: true,
      thread_type: "rayon",
      is_ombre: true,
      ombre_colors: [
        { color: "Emerald", percentage: 45 },
        { color: "Silver", percentage: 30 },
        { color: "White", percentage: 25 },
      ],
      has_embroidery: false,
    },
    approvals: {
      thread: "pending",
      thread_at: null,
      pattern: "pending",
      pattern_at: null,
    },
    delivery_status: "pending",
    payment_status: "unpaid",
    is_paused: false,
    created_at: daysAgo(9),
    updated_at: daysAgo(1),
  },
  {
    id: "pr-3",
    reference: "HK-2026-0043",
    title: "Graduation stole batch — KTU",
    client_id: "cl-3",
    weaver_id: "weaver-1",
    pattern: "Custom lettering",
    measurements: { note: "72in x 5in, 25 pieces" },
    thread_colors: ["Black", "Gold", "Green"],
    accessories: [],
    quantity: 25,
    priority: "urgent",
    current_stage_id: stageId("Quality Inspection"),
    progress_pct: 90,
    est_start: daysAgo(18).slice(0, 10),
    est_completion: daysAhead(4),
    actual_completion: null,
    design_notes: "Each stole carries the graduate's embroidered name.",
    spec: {
      design_yards: 4,
      plain_yards: 1,
      gender: "man",
      garment_type: null,
      has_border: false,
      has_shimmers: false,
      thread_type: "rayon",
      is_ombre: false,
      ombre_colors: [],
      has_embroidery: true,
    },
    approvals: {
      thread: "approved",
      thread_at: daysAgo(16),
      pattern: "approved",
      pattern_at: daysAgo(15),
    },
    delivery_status: "pending",
    payment_status: "paid",
    is_paused: false,
    created_at: daysAgo(20),
    updated_at: daysAgo(0, 5),
  },
];

export const demoMedia: MediaRow[] = [
  {
    id: "md-1",
    project_id: "pr-1",
    update_id: "up-4",
    work_log_id: null,
    storage_path: "/images/inspiring-tradition-carousel-craftmanship.jpg",
    kind: "image",
    caption: "Border motif taking shape",
    uploaded_by: "weaver-1",
    created_at: daysAgo(0, 3),
    url: "/images/inspiring-tradition-carousel-craftmanship.jpg",
  },
  {
    id: "md-2",
    project_id: "pr-1",
    update_id: "up-4",
    work_log_id: null,
    storage_path: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
    kind: "image",
    caption: "Panels on the loom",
    uploaded_by: "weaver-1",
    created_at: daysAgo(0, 3),
    url: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
  },
  {
    id: "md-3",
    project_id: "pr-1",
    update_id: "up-2",
    work_log_id: null,
    storage_path: "/images/hinkro-kente-design-process-sketch.png",
    kind: "image",
    caption: "Approved design sketch",
    uploaded_by: "demo-user",
    created_at: daysAgo(11),
    purpose: "progress",
    url: "/images/hinkro-kente-design-process-sketch.png",
  },
  {
    id: "md-insp-1",
    project_id: "pr-1",
    update_id: null,
    work_log_id: null,
    storage_path: "/images/hinkro-bespoke-storytelling-pattern.jpg",
    kind: "image",
    caption: "Reference: dense border, lighter centre",
    uploaded_by: "demo-user",
    created_at: daysAgo(12),
    purpose: "inspiration",
    url: "/images/hinkro-bespoke-storytelling-pattern.jpg",
  },
  {
    id: "md-insp-2",
    project_id: "pr-1",
    update_id: null,
    work_log_id: null,
    storage_path: "/images/hinkro-bespoke-custom-color-way.jpg",
    kind: "image",
    caption: "Reference: gold & royal blue colour way",
    uploaded_by: "demo-user",
    created_at: daysAgo(12),
    purpose: "inspiration",
    url: "/images/hinkro-bespoke-custom-color-way.jpg",
  },
  {
    id: "md-sym-1",
    project_id: "pr-3",
    update_id: null,
    work_log_id: null,
    storage_path: "/images/hinkro-kente-shuttle-illustration.png",
    kind: "image",
    caption: "Embroidery symbol: university crest placement",
    uploaded_by: "demo-user",
    created_at: daysAgo(20),
    purpose: "embroidery_symbol",
    url: "/images/hinkro-kente-shuttle-illustration.png",
  },
];

export const demoCatalogProducts: ProductRow[] = storeProducts.map((product, index) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  type: product.type,
  categories: product.categories ?? [],
  tags: product.tags ?? [],
  colors: product.colors ?? [],
  is_accessory: product.isAccessory,
  is_featured: product.isFeatured,
  stock_text: product.stockText,
  prices: product.prices ?? {},
  short_description: product.shortDescription || null,
  description: product.description || null,
  seo: product.seo ?? {},
  status: "published",
  sort: index,
  created_at: daysAgo(30),
  updated_at: daysAgo(1),
  images: (product.images ?? []).map((image, imageIndex) => ({
    id: `pi-${product.id}-${imageIndex + 1}`,
    product_id: product.id,
    src: image.src,
    alt: image.alt ?? product.name,
    position: imageIndex,
    role: imageIndex === 0 ? "primary" : "gallery",
  })),
  variations: (product.variations ?? []).map((variation, variationIndex) => ({
    id: `pv-${product.id}-${variationIndex + 1}`,
    product_id: product.id,
    attributes: {
      name: variation.name,
      option: variation.option,
    },
    prices: {
      ghana: { min: variation.priceGhs ?? null, max: variation.priceGhs ?? null, currency: "GHS" },
      international: { min: variation.priceUsd ?? null, max: variation.priceUsd ?? null, currency: "USD" },
    },
  })),
}));

export const demoCategories: CategoryRow[] = [
  ...storeCategories.map((name, index) => ({
    id: `cat-product-${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    kind: name === "Accessories" ? "accessory" as const : "product" as const,
    position: index,
    image_url:
      name === "Accessories"
        ? "/images/hinkro-accessory-bridal-hand-fan-product.jpg"
        : null,
  })),
  {
    id: "cat-blog-1",
    name: "Trends & News",
    slug: "trends-news",
    kind: "blog",
    position: 0,
    image_url: "/images/hinkro-kente-trends-news-yellow-bridal-kente.jpg",
  },
];

export const demoBlogPosts: BlogPostRow[] = defaultBlogPosts.map((post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
  featured_image: post.featured_image,
  status: "published",
  publish_at: post.publish_at,
  seo: {
    title: post.title,
    description: post.excerpt,
    keywords: ["Kente trends", "Hinkro Kente", "Ghana Kente"],
  },
  author_id: "demo-user",
  created_at: post.publish_at,
  updated_at: post.publish_at,
}));

const legacyDemoBlogPosts: BlogPostRow[] = [
  {
    id: "bp-1",
    slug: "types-of-threads-used-in-kente",
    title: "3 Types of Threads Used in Kente: A Buyer's Guide to Quality",
    excerpt:
      "When you set out to purchase authentic Kente, the price tag often varies significantly. One of the biggest factors behind that price and the overall look and feel of the cloth is the type of thread used.",
    content:
      "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2026/07/Rayon-Kente-Thread-768x576.jpeg",
    status: "published",
    publish_at: "2026-07-07T18:51:18.000Z",
    seo: {
      title: "3 Types of Threads Used in Kente: A Buyer's Guide to Quality",
      description: "A buyer's guide to Rayon, Polyester, and Silk threads used in Kente.",
      keywords: ["Kente threads", "Rayon Kente thread", "Kente quality"],
    },
    author_id: "demo-user",
    created_at: "2026-07-07T18:51:18.000Z",
    updated_at: "2026-07-07T18:51:18.000Z",
  },
  {
    id: "bp-2",
    slug: "kente-belt",
    title: "The Kente Belt: Understanding the Art and Craftmanship of the Owontoma in the Kente Artistery",
    excerpt:
      "The beauty of Kente is not only found in its colors or symbols. Much of its elegance lies in the details that many people often overlook.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2026/05/featured-image-768x383.jpg",
    status: "published",
    publish_at: "2026-05-26T13:11:40.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2026-05-26T13:11:40.000Z",
    updated_at: "2026-05-26T13:11:40.000Z",
  },
  {
    id: "bp-3",
    slug: "in-appreciation-of-nana-konadu-agyeman-rawlings",
    title: "In Appreciation of Nana Konadu Agyeman-Rawlings",
    excerpt:
      "Hinkro Kente joins the nation of Ghana and admirers across the world in honoring Nana Konadu Agyeman-Rawlings.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-10-23-at-14.37.23-400x470-1.webp",
    status: "published",
    publish_at: "2025-11-28T15:20:21.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2025-11-28T15:20:21.000Z",
    updated_at: "2025-11-28T15:20:21.000Z",
  },
  {
    id: "bp-4",
    slug: "kente-officially-protected-as-a-national-treasure",
    title: "Ghana Makes History: Kente Officially Protected as a National Treasure",
    excerpt:
      "It is now official. The Ghanaian government has granted Kente cloth Geographical Indication status.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2025/10/IMG_1149-768x1024.jpg",
    status: "published",
    publish_at: "2025-10-11T19:00:22.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2025-10-11T19:00:22.000Z",
    updated_at: "2025-10-11T19:00:22.000Z",
  },
  {
    id: "bp-5",
    slug: "kente-for-organizational-groups-and-corporate-businesses",
    title: "Kente for Organizational Groups and Corporate Businesses: Elevate Your Brand with Culture and Class",
    excerpt:
      "In today's competitive business world, standing out is more than a goal. Many organizations are turning to Kente as a bold cultural asset.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2025/05/Kente-for-organizational-groups-and-corporate-businesses-768x1152.png",
    status: "published",
    publish_at: "2025-05-17T11:58:09.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2025-05-17T11:58:09.000Z",
    updated_at: "2025-05-17T11:58:09.000Z",
  },
  {
    id: "bp-6",
    slug: "black-star-experience",
    title: "Ghana Launches the Black Star Experience to Rebrand as Africa's Cultural Powerhouse",
    excerpt:
      "Ghana has taken a bold step towards repositioning itself as Africa's premier cultural and creative hub with the Black Star Experience.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2025/05/WhatsApp_Image_2025_05_02_at_18_24_42_1746207699-768x512.jpeg",
    status: "published",
    publish_at: "2025-05-04T19:32:26.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2025-05-04T19:32:26.000Z",
    updated_at: "2025-05-04T19:32:26.000Z",
  },
  {
    id: "bp-7",
    slug: "kente-and-kitenge",
    title: "Kente vs Kitenge: Unraveling the Threads of African Textile Heritage",
    excerpt:
      "Africa's textile traditions are diverse and vibrant. Among the most iconic are Kente and Kitenge fabrics.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2025/05/Kente-vs-kitenge-768x371.jpg",
    status: "published",
    publish_at: "2025-05-03T23:30:46.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2025-05-03T23:30:46.000Z",
    updated_at: "2025-05-03T23:30:46.000Z",
  },
  {
    id: "bp-8",
    slug: "developing-kente-pattern-for-weaving",
    title: "Hinkro Kente: Leading the way in developing Kente Patterns for Weaving",
    excerpt:
      "Kente cloth has always stood as a symbol of tradition, identity, and prestige, with intricate patterns and bold colors.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2024/09/Developing-Kente-patterns-01-768x379.jpg",
    status: "published",
    publish_at: "2024-09-28T12:59:08.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2024-09-28T12:59:08.000Z",
    updated_at: "2024-09-28T12:59:08.000Z",
  },
  {
    id: "bp-9",
    slug: "african-artifact",
    title: "African Artifact: A Timeless Expression of Cultural Heritage",
    excerpt:
      "African artifacts represent a profound connection between the past and present, offering insight into rich history and cultural practices.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2024/09/PHOTO-2023-08-11-15-11-49-768x805.jpg",
    status: "published",
    publish_at: "2024-09-09T00:46:28.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2024-09-09T00:46:28.000Z",
    updated_at: "2024-09-09T00:46:28.000Z",
  },
  {
    id: "bp-10",
    slug: "computerized-kente-pattern",
    title: "The Art of Computerized Pattern Generation in Modern Kente Weaving",
    excerpt:
      "As technology evolves, so does the art of Kente design and pattern generation in modern weaving.",
    content: "Imported from the Hinkro Kente Trends archive. Full article content can be expanded in the editor.",
    featured_image: "https://www.hinkrokente.com/wp-content/uploads/2024/08/212f15fb772ef8314c2014a4793f5a6e.jpg",
    status: "published",
    publish_at: "2024-08-25T21:53:35.000Z",
    seo: {},
    author_id: "demo-user",
    created_at: "2024-08-25T21:53:35.000Z",
    updated_at: "2024-08-25T21:53:35.000Z",
  },
];

export const demoLibraryAssets: LibraryAssetRow[] = [
  {
    id: "lib-1",
    storage_path: "/images/hinkro-kente-trends-news-yellow-bridal-kente.jpg",
    kind: "image",
    title: "Yellow bridal Kente",
    alt: "Yellow bridal Kente fashion inspiration by Hinkro Kente",
    caption: "Yellow bridal Kente fashion inspiration",
    description: "Editorial image used for Hinkro Kente trends and bridal styling content.",
    folder: "Trends",
    size_bytes: 428000,
    exclude_from_sitemap: false,
    uploaded_by: "demo-user",
    created_at: daysAgo(10),
    url: "/images/hinkro-kente-trends-news-yellow-bridal-kente.jpg",
  },
  {
    id: "lib-2",
    storage_path: "/images/hinkro-accessory-bridal-hand-fan.jpg",
    kind: "image",
    title: "Bridal hand fan",
    alt: "Hinkro Kente bridal hand fan accessory",
    caption: "Bridal hand fan accessory",
    description: "Accessory image for product and media-library preview.",
    folder: "Accessories",
    size_bytes: 312000,
    exclude_from_sitemap: false,
    uploaded_by: "demo-user",
    created_at: daysAgo(6),
    url: "/images/hinkro-accessory-bridal-hand-fan.jpg",
  },
  {
    id: "lib-3",
    storage_path: "/videos/kente-graduation-stole-sash-hero-video.mp4",
    kind: "video",
    title: "Graduation stole hero video",
    alt: "Graduation stole sash hero video",
    caption: "Graduation stole hero video",
    description: "Hero motion asset for graduation stole marketing.",
    folder: "Graduation",
    size_bytes: 18400000,
    exclude_from_sitemap: true,
    uploaded_by: "demo-user",
    created_at: daysAgo(20),
    url: "/videos/kente-graduation-stole-sash-hero-video.mp4",
  },
];

export const demoUpdates: UpdateRow[] = [
  {
    id: "up-1",
    project_id: "pr-1",
    author_id: "demo-user",
    type: "note",
    stage_id: stageId("Order Received"),
    progress_pct: 0,
    body: "Project created. Welcome, Deborah! Your bespoke wedding Kente order is confirmed.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(12),
    author: { full_name: "Ama Serwaa", role: "admin" },
  },
  {
    id: "up-2",
    project_id: "pr-1",
    author_id: "demo-user",
    type: "media",
    stage_id: null,
    progress_pct: null,
    body: "Design sketch approved by the studio.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(11),
    author: { full_name: "Ama Serwaa", role: "admin" },
  },
  {
    id: "up-3",
    project_id: "pr-1",
    author_id: "weaver-1",
    type: "status_change",
    stage_id: stageId("Weaving Started"),
    progress_pct: 35,
    body: "Threads are on the loom — weaving has begun.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(7),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
  {
    id: "up-4",
    project_id: "pr-1",
    author_id: "weaver-1",
    type: "progress",
    stage_id: stageId("Weaving in Progress"),
    progress_pct: 65,
    body: "Past the halfway mark. The Adweneasa border is coming out beautifully — see the photos.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(0, 3),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
  {
    id: "up-5",
    project_id: "pr-3",
    author_id: "weaver-1",
    type: "progress",
    stage_id: stageId("Quality Inspection"),
    progress_pct: 90,
    body: "All 25 stoles woven; checking embroidered names against the graduate list.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(0, 5),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
];

export const demoWorkLogs: WorkLogRow[] = [
  {
    id: "wl-1",
    project_id: "pr-1",
    weaver_id: "weaver-1",
    log_date: daysAgo(1).slice(0, 10),
    hours_worked: 6.5,
    progress_made: "Completed second border panel",
    materials_used: "Gold and royal blue silk-blend thread",
    challenges: "Humidity affecting thread tension in the afternoon",
    notes: null,
    created_at: daysAgo(1),
  },
  {
    id: "wl-2",
    project_id: "pr-1",
    weaver_id: "weaver-1",
    log_date: daysAgo(0).slice(0, 10),
    hours_worked: 5,
    progress_made: "Centre panel underway, 65% overall",
    materials_used: "Ivory accent thread",
    challenges: null,
    notes: "Photos uploaded for the client.",
    created_at: daysAgo(0, 3),
  },
];

export const demoNotifications: NotificationRow[] = [
  {
    id: "nt-1",
    user_id: "demo-user",
    type: "progress",
    title: "Update on HK-2026-0041",
    body: "Past the halfway mark. The Adweneasa border is coming out beautifully.",
    data: { project_id: "pr-1", update_id: "up-4" },
    read_at: null,
    created_at: daysAgo(0, 3),
  },
  {
    id: "nt-2",
    user_id: "demo-user",
    type: "progress",
    title: "Update on HK-2026-0043",
    body: "All 25 stoles woven; names being checked.",
    data: { project_id: "pr-3", update_id: "up-5" },
    read_at: daysAgo(0, 4),
    created_at: daysAgo(0, 5),
  },
];

export const demoMessages: MessageRow[] = [
  {
    id: "ms-1",
    project_id: null,
    sender_id: "demo-user",
    recipient_id: null,
    audience: "all",
    body: "The studio will be closed this Friday for the Homowo festival. All project timelines have been adjusted accordingly — enjoy the celebration!",
    created_at: daysAgo(2),
    sender: { full_name: "Ama Serwaa", role: "admin" },
    recipient: null,
  },
  {
    id: "ms-2",
    project_id: "pr-1",
    sender_id: "demo-user",
    recipient_id: "weaver-1",
    audience: "user",
    body: "Kwabena — Deborah's wedding moved up two days. Please prioritise the border work this week.",
    created_at: daysAgo(1, 4),
    sender: { full_name: "Ama Serwaa", role: "admin" },
    recipient: { full_name: "Kwabena Owusu" },
  },
];

/* ---------- tiny reactive store ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDemo(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitDemo() {
  persistDemo();
  listeners.forEach((fn) => fn());
}

/* ---------- session persistence ----------
   Keeps demo mutations alive across role switches (which reload the page),
   so the admin → weaver → client loop can be experienced end to end.
   Cleared when the browser tab closes. */

const PERSIST_KEY = "hinkro-demo-db";

function persistDemo() {
  try {
    sessionStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        clients: demoClients,
        projects: demoProjects,
        updates: demoUpdates,
        workLogs: demoWorkLogs,
        media: demoMedia,
        notifications: demoNotifications,
        messages: demoMessages,
        weaverProfiles: demoWeaverProfiles,
        seq,
      }),
    );
  } catch {
    /* storage full or unavailable — demo simply won't persist */
  }
}

function hydrateDemo() {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    demoClients.splice(0, demoClients.length, ...saved.clients);
    demoProjects.splice(0, demoProjects.length, ...saved.projects);
    demoUpdates.splice(0, demoUpdates.length, ...saved.updates);
    demoWorkLogs.splice(0, demoWorkLogs.length, ...saved.workLogs);
    demoMedia.splice(0, demoMedia.length, ...saved.media);
    demoNotifications.splice(0, demoNotifications.length, ...saved.notifications);
    if (saved.messages) demoMessages.splice(0, demoMessages.length, ...saved.messages);
    if (saved.weaverProfiles)
      demoWeaverProfiles.splice(0, demoWeaverProfiles.length, ...saved.weaverProfiles);
    if (typeof saved.seq === "number") seq = saved.seq;
  } catch {
    /* corrupted snapshot — fall back to fixtures */
  }
}

hydrateDemo();

/** Map the active demo role to the fixture identities used in queries. */
export function demoIdentity(role: string): {
  profileId: string;
  clientId: string | null;
} {
  if (role === "weaver") return { profileId: "weaver-1", clientId: null };
  if (role === "client") return { profileId: "client-1", clientId: "cl-1" };
  return { profileId: "demo-user", clientId: null };
}
