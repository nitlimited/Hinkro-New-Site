export const THREAD_COLOR_CLASSES = [
  {
    id: "neutrals",
    label: "Neutrals",
    colors: [
      { id: "black", name: "Black", image: "/images/thread-colors/Neutrals/Black.jpg" },
      { id: "grey", name: "Grey", image: "/images/thread-colors/Neutrals/Grey.jpg" },
      { id: "white", name: "White", image: "/images/thread-colors/Neutrals/White.jpg" },
    ],
  },
  {
    id: "reds",
    label: "Reds",
    colors: [
      { id: "red", name: "Red", image: "/images/thread-colors/Reds/Red.jpg" },
      { id: "delta-red", name: "Delta Red", image: "/images/thread-colors/Reds/Delta Red.jpg" },
      { id: "wine", name: "Wine", image: "/images/thread-colors/Reds/Wine.jpg" },
      { id: "hot-pink", name: "Hot Pink", image: "/images/thread-colors/Reds/Hot Pink.jpg" },
    ],
  },
  {
    id: "blues",
    label: "Blues",
    colors: [
      { id: "royal-blue", name: "Royal Blue", image: "/images/thread-colors/Blues/Royal Blue.jpg" },
      { id: "navy-blue", name: "Navy Blue", image: "/images/thread-colors/Blues/Navy Blue.jpg" },
      { id: "light-blue", name: "Light Blue", image: "/images/thread-colors/Blues/Light Blue.jpg" },
      { id: "teal", name: "Teal", image: "/images/thread-colors/Blues/Teal.jpg" },
    ],
  },
  {
    id: "greens",
    label: "Greens",
    colors: [
      { id: "green", name: "Green", image: "/images/thread-colors/Greens/Green.jpg" },
      { id: "emerald-green", name: "Emerald Green", image: "/images/thread-colors/Greens/Emerald Green.jpg" },
      { id: "olive-green", name: "Olive Green", image: "/images/thread-colors/Greens/Olive Green.jpg" },
      { id: "lemon-green", name: "Lemon Green", image: "/images/thread-colors/Greens/Lemon Green.jpg" },
    ],
  },
  {
    id: "yellows",
    label: "Yellows",
    colors: [
      { id: "gold", name: "Gold", image: "/images/thread-colors/Yellows/Gold.jpg" },
      { id: "lemon-yellow", name: "Lemon Yellow", image: "/images/thread-colors/Yellows/Lemon Yellow.jpg" },
      { id: "butter", name: "Butter", image: "/images/thread-colors/Yellows/Butter.jpg" },
      { id: "curry", name: "Curry", image: "/images/thread-colors/Yellows/Curry.jpg" },
    ],
  },
  {
    id: "browns",
    label: "Browns",
    colors: [
      { id: "brown", name: "Brown", image: "/images/thread-colors/Browns/Brown.jpg" },
      { id: "coffee", name: "Coffee", image: "/images/thread-colors/Browns/Coffee .jpg" },
      { id: "dark-coffee", name: "Dark Coffee", image: "/images/thread-colors/Browns/Dark. Coffee.jpg" },
    ],
  },
  {
    id: "orange",
    label: "Orange",
    colors: [
      { id: "orange", name: "Orange", image: "/images/thread-colors/Orange/Orange.jpg" },
      { id: "burnt-orange", name: "Burnt Orange", image: "/images/thread-colors/Orange/Burnt Orange.jpg" },
      { id: "peach", name: "Peach", image: "/images/thread-colors/Orange/Peach.jpg" },
      { id: "blush", name: "Blush", image: "/images/thread-colors/Orange/Blush.jpg" },
    ],
  },
  {
    id: "purple",
    label: "Purple",
    colors: [
      { id: "purple", name: "Purple", image: "/images/thread-colors/Purple/Purple.jpg" },
      { id: "lavender", name: "Lavender", image: "/images/thread-colors/Purple/Lavender.jpg" },
      { id: "mauve", name: "Mauve", image: "/images/thread-colors/Purple/Mauve.jpg" },
      { id: "baby-pink", name: "Baby Pink", image: "/images/thread-colors/Purple/Baby Pink.jpg" },
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
