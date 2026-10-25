import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Aura Obsidian Square",
    sku: "AK-OPT-001",
    category: "Prescription Glasses",
    frameShape: "Square",
    material: "Italian Mazzucchelli Acetate",
    gender: "Unisex",
    basePrice: 5800,
    salePrice: 4600,
    stock: 24,
    rating: 4.9,
    reviewsCount: 38,
    isBestseller: true,
    isFeatured: true,
    description: "Architectural precision meets effortless minimalism. Hand-polished obsidian black acetate featuring custom 5-barrel hinges and spring-flex temples.",
    dimensions: {
      lensWidth: 52,
      bridgeWidth: 18,
      templeLength: 140
    },
    faceShapesRecommended: ["Round", "Oval", "Heart"],
    colors: [
      { name: "Matte Black", hex: "#121215" },
      { name: "Amber Tortoise", hex: "#5c3a21" },
      { name: "Crystal Smoke", hex: "#787882" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "square_acetate",
    vtoOverlayColor: "#121215",
    vtoScaleMultiplier: 1.05,
    vtoVerticalOffset: 0
  },
  {
    id: "p2",
    title: "Aviator Horizon Gold",
    sku: "AK-SUN-002",
    category: "Sunglasses",
    frameShape: "Aviator",
    material: "Electroplated Stainless Steel",
    gender: "Men",
    basePrice: 7200,
    salePrice: 5900,
    stock: 18,
    rating: 4.8,
    reviewsCount: 52,
    isBestseller: true,
    isFeatured: true,
    description: "Iconic teardrop aviator silhouette engineered with ultra-lightweight aerospace alloy, polarized UV400 gradient lenses, and silicone air-cushion nose pads.",
    dimensions: {
      lensWidth: 58,
      bridgeWidth: 14,
      templeLength: 145
    },
    faceShapesRecommended: ["Square", "Oval", "Heart"],
    colors: [
      { name: "Champagne Gold / Emerald Green", hex: "#d4af37" },
      { name: "Gunmetal / Midnight Blue", hex: "#2f3542" },
      { name: "Matte Silver / Mirror Silver", hex: "#c0c0c0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "aviator",
    vtoOverlayColor: "#d4af37",
    vtoScaleMultiplier: 1.15,
    vtoVerticalOffset: 2
  },
  {
    id: "p3",
    title: "Solstice Amber Cat-Eye",
    sku: "AK-OPT-003",
    category: "Prescription Glasses",
    frameShape: "Cat-Eye",
    material: "Bio-Cellulose Acetate",
    gender: "Women",
    basePrice: 6500,
    salePrice: 5200,
    stock: 15,
    rating: 5,
    reviewsCount: 29,
    isBestseller: false,
    isFeatured: true,
    description: "Subtle vintage flair redefined for modern elegance. Uplifting cat-eye corners sculpt cheekbones and add refined glamour to any everyday outfit.",
    dimensions: {
      lensWidth: 53,
      bridgeWidth: 16,
      templeLength: 140
    },
    faceShapesRecommended: ["Round", "Diamond", "Square"],
    colors: [
      { name: "Amber Tortoise", hex: "#8c4d1f" },
      { name: "Blush Rose Quartz", hex: "#e8b4b8" },
      { name: "Midnight Onyx", hex: "#0f0f11" }
    ],
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "cateye",
    vtoOverlayColor: "#8c4d1f",
    vtoScaleMultiplier: 1.08,
    vtoVerticalOffset: -2
  },
  {
    id: "p4",
    title: "Titan Ultralight Rimless",
    sku: "AK-OPT-004",
    category: "Prescription Glasses",
    frameShape: "Rectangle",
    material: "Pure Japanese Beta-Titanium",
    gender: "Unisex",
    basePrice: 8900,
    salePrice: 7500,
    stock: 12,
    rating: 4.9,
    reviewsCount: 44,
    isBestseller: true,
    isFeatured: true,
    description: "Featherweight luxury weighing only 8.6 grams. Screwless hinge engineering and Japanese beta-titanium memory wire provide all-day zero-pressure comfort.",
    dimensions: {
      lensWidth: 51,
      bridgeWidth: 19,
      templeLength: 142
    },
    faceShapesRecommended: ["Oval", "Round", "Diamond"],
    colors: [
      { name: "Brushed Gunmetal", hex: "#4b4b52" },
      { name: "Champagne Satin", hex: "#d4af37" },
      { name: "Platinum Silver", hex: "#e2e2e8" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "rimless",
    vtoOverlayColor: "#4b4b52",
    vtoScaleMultiplier: 1,
    vtoVerticalOffset: 0
  },
  {
    id: "p5",
    title: "CyberGuard BlueShield Pro",
    sku: "AK-BLU-005",
    category: "Blue-Light Glasses",
    frameShape: "Round",
    material: "TR90 Ultra-Flex Polymer",
    gender: "Unisex",
    basePrice: 4500,
    salePrice: 3500,
    stock: 45,
    rating: 4.8,
    reviewsCount: 89,
    isBestseller: true,
    isFeatured: true,
    description: "Engineered for coders, designers, and screen power-users. Filters 98% of harmful 415-455nm blue light with zero color tinting and anti-glare nano-coating.",
    dimensions: {
      lensWidth: 50,
      bridgeWidth: 20,
      templeLength: 142
    },
    faceShapesRecommended: ["Square", "Diamond", "Heart"],
    colors: [
      { name: "Crystal Transparent", hex: "#d0d5dd" },
      { name: "Frosted Smoke", hex: "#475467" },
      { name: "Matte Black", hex: "#121215" }
    ],
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "round",
    vtoOverlayColor: "#d0d5dd",
    vtoScaleMultiplier: 1.05,
    vtoVerticalOffset: 0
  },
  {
    id: "p6",
    title: "Neo-Geometric Octagon",
    sku: "AK-OPT-006",
    category: "Prescription Glasses",
    frameShape: "Geometric",
    material: "Surgical Grade Steel",
    gender: "Unisex",
    basePrice: 6200,
    salePrice: 4900,
    stock: 19,
    rating: 4.7,
    reviewsCount: 21,
    isBestseller: false,
    isFeatured: false,
    description: "Edgy, intellectual statement frame featuring eight hand-beveled facets, gold filigree wire temples, and adjustable hypoallergenic nose pads.",
    dimensions: {
      lensWidth: 49,
      bridgeWidth: 21,
      templeLength: 145
    },
    faceShapesRecommended: ["Round", "Oval"],
    colors: [
      { name: "Antique Gold", hex: "#c5a059" },
      { name: "Rose Bronze", hex: "#b76e79" },
      { name: "Midnight Gunmetal", hex: "#343a40" }
    ],
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "octagon",
    vtoOverlayColor: "#c5a059",
    vtoScaleMultiplier: 1.02,
    vtoVerticalOffset: 0
  }
];
