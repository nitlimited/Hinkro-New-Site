export const THREAD_COLOR_CLASSES = [
  {
    id: "neutrals",
    label: "Neutrals",
    colors: [
      { id: "white", name: "White", image: "/images/thread-colors/Neutrals/White.jpg" },
      { id: "off-white", name: "Off White", image: "/images/thread-colors/Neutrals/Off White.png" },
      { id: "grey", name: "Grey", image: "/images/thread-colors/Neutrals/Grey.jpg" },
      { id: "black", name: "Black", image: "/images/thread-colors/Neutrals/Black.jpg" },
    ],
  },
  {
    id: "yellows",
    label: "Yellows",
    colors: [
      { id: "lemon-yellow", name: "Lemon Yellow", image: "/images/thread-colors/Yellows/Lemon Yellow.jpg" },
      { id: "butter", name: "Butter", image: "/images/thread-colors/Yellows/Butter.jpg" },
      { id: "gold", name: "Gold", image: "/images/thread-colors/Yellows/Gold.jpg" },
      { id: "curry", name: "Curry", image: "/images/thread-colors/Yellows/Curry.jpg" },
    ],
  },
  {
    id: "orange",
    label: "Orange",
    colors: [
      { id: "blush", name: "Blush", image: "/images/thread-colors/Orange/Blush.jpg" },
      { id: "peach", name: "Peach", image: "/images/thread-colors/Orange/Peach.jpg" },
      { id: "orange", name: "Orange", image: "/images/thread-colors/Orange/Orange.jpg" },
      { id: "burnt-orange", name: "Burnt Orange", image: "/images/thread-colors/Orange/Burnt Orange.jpg" },
    ],
  },
  {
    id: "reds",
    label: "Reds",
    colors: [
      { id: "hot-pink", name: "Hot Pink", image: "/images/thread-colors/Reds/Hot Pink.jpg" },
      { id: "red", name: "Red", image: "/images/thread-colors/Reds/Red.jpg" },
      { id: "delta-red", name: "Delta Red", image: "/images/thread-colors/Reds/Delta Red.jpg" },
      { id: "wine", name: "Wine", image: "/images/thread-colors/Reds/Wine.jpg" },
    ],
  },
  {
    id: "purple",
    label: "Purple",
    colors: [
      { id: "baby-pink", name: "Baby Pink", image: "/images/thread-colors/Purple/Baby Pink.jpg" },
      { id: "lavender", name: "Lavender", image: "/images/thread-colors/Purple/Lavender.jpg" },
      { id: "mauve", name: "Mauve", image: "/images/thread-colors/Purple/Mauve.jpg" },
      { id: "purple", name: "Purple", image: "/images/thread-colors/Purple/Purple.jpg" },
    ],
  },
  {
    id: "blues",
    label: "Blues",
    colors: [
      { id: "mint-blue", name: "Mint Blue", image: "/images/thread-colors/Blues/Mint Blue.png" },
      { id: "light-blue", name: "Light Blue", image: "/images/thread-colors/Blues/Light Blue.jpg" },
      { id: "turquise-blue", name: "Turquise Blue", image: "/images/thread-colors/Blues/Turquise Blue.png" },
      { id: "us-blue", name: "US Blue", image: "/images/thread-colors/Blues/US Blue.png" },
      { id: "royal-blue", name: "Royal Blue", image: "/images/thread-colors/Blues/Royal Blue.jpg" },
      { id: "teal", name: "Teal", image: "/images/thread-colors/Blues/Teal.jpg" },
      { id: "navy-blue", name: "Navy Blue", image: "/images/thread-colors/Blues/Navy Blue.jpg" },
    ],
  },
  {
    id: "greens",
    label: "Greens",
    colors: [
      { id: "mint-green", name: "Mint Green", image: "/images/thread-colors/Greens/Mint Green.png" },
      { id: "lemon-green", name: "Lemon Green", image: "/images/thread-colors/Greens/Lemon Green.jpg" },
      { id: "green", name: "Green", image: "/images/thread-colors/Greens/Green.jpg" },
      { id: "turquise-green", name: "Turquise Green", image: "/images/thread-colors/Greens/Turquise Green.png" },
      { id: "emerald-green", name: "Emerald Green", image: "/images/thread-colors/Greens/Emerald Green.jpg" },
      { id: "olive-green", name: "Olive Green", image: "/images/thread-colors/Greens/Olive Green.jpg" },
    ],
  },
  {
    id: "browns",
    label: "Browns",
    colors: [
      { id: "cream", name: "Cream", image: "/images/thread-colors/Browns/Cream.png" },
      { id: "khaki", name: "Khaki", image: "/images/thread-colors/Browns/Khaki.png" },
      { id: "brown", name: "Brown", image: "/images/thread-colors/Browns/Brown.jpg" },
      { id: "coffee", name: "Coffee", image: "/images/thread-colors/Browns/Coffee .jpg" },
      { id: "dark-coffee", name: "Dark Coffee", image: "/images/thread-colors/Browns/Dark. Coffee.jpg" },
    ],
  },
];

export const THREAD_COLOR_IMAGES = [
  "/images/thread-colors/Artboard32.jpg",
  "/images/thread-colors/Artboard33.jpg",
  "/images/thread-colors/Artboard34.jpg",
];

export function getAllThreadColors() {
  return THREAD_COLOR_CLASSES.flatMap((cls) => cls.colors);
}

export function findThreadColor(colorId) {
  return getAllThreadColors().find((c) => c.id === colorId);
}
