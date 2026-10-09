export type Product = {
  slug: string;
  number: string;
  name: string;
  ritual: string;
  price: number;
  size: string;
  description: string;
  ingredients: string;
  usage: string;
  benefit: string;
  faq: string;
  image: string;
  hoverImage: string;
  badge: "Best Seller" | "New" | "Save 20%" | "Limited Stock" | "Sold Out";
  stock: number;
  rating: number;
  reviewCount: number;
  compareAtPrice: number;
  type: ProductType;
  concerns: Concern[];
  skinTypes: SkinType[];
  addedAt: string;
};

export type ProductType = "Cleanser" | "Serum" | "Cream";
export type Concern = "Dullness" | "Dryness" | "Uneven tone" | "Sensitivity";
export type SkinType = "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive";
export const productTypes: ProductType[] = ["Cleanser", "Serum", "Cream"];
export const concerns: Concern[] = ["Dullness", "Dryness", "Uneven tone", "Sensitivity"];

import serum from "@/assets/leva-radiance-serum.png.asset.json";
import ritual from "@/assets/leva-ritual-hero.png.asset.json";
import balm from "@/assets/leva-cleansing-balm.png.asset.json";

export const products: Product[] = [
  {
    slug: "product-01",
    number: "01",
    name: "Brightening Cream",
    ritual: "The first veil",
    price: 6800,
    size: "50 ML",
    description: "A luminous daily veil created as a clean placeholder for LEVA's first formula.",
    ingredients: "Formula details ready to be replaced with your final ingredient list.",
    usage: "Massage onto clean skin in slow upward movements each morning.",
    benefit: "Softens the look of tired, dry skin.",
    faq: "Designed as an everyday step for all skin types. Patch test before first use.",
    image: balm.url,
    hoverImage: balm.url,
    badge: "Best Seller",
    type: "Cream",
    concerns: ["Dullness", "Uneven tone", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination"],
    addedAt: "2026-06-01",
    stock: 18,
    rating: 4.9,
    reviewCount: 126,
    compareAtPrice: 8500,
  },
  {
    slug: "product-02",
    number: "02",
    name: "Radiance Serum",
    ritual: "The quiet reset",
    price: 7900,
    size: "30 ML",
    description:
      "A concentrated night ritual created as a clean placeholder for LEVA's second formula.",
    ingredients: "Formula details ready to be replaced with your final ingredient list.",
    usage: "Press a few drops into skin after cleansing, then pause and breathe.",
    benefit: "Replenishes skin through the quiet hours.",
    faq: "Use alone or follow with PRODUCT 01. Patch test before first use.",
    image: serum.url,
    hoverImage: serum.url,
    badge: "New",
    type: "Serum",
    concerns: ["Dullness", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination", "Oily"],
    addedAt: "2026-09-15",
    stock: 12,
    rating: 4.8,
    reviewCount: 84,
    compareAtPrice: 9900,
  },
  {
    slug: "product-03",
    number: "03",
    name: "Gentle Face Wash",
    ritual: "The final touch",
    price: 5400,
    size: "15 ML",
    description:
      "A precise finishing treatment created as a clean placeholder for LEVA's third formula.",
    ingredients: "Formula details ready to be replaced with your final ingredient list.",
    usage: "Tap gently where the skin asks for extra care, morning or evening.",
    benefit: "Targets the places that need extra care.",
    faq: "Created for precise application morning or evening. Patch test before first use.",
    image: ritual.url,
    hoverImage: ritual.url,
    badge: "Limited Stock",
    type: "Cleanser",
    concerns: ["Sensitivity"],
    skinTypes: ["Oily", "Combination", "Normal", "Sensitive"],
    addedAt: "2026-07-20",
    stock: 7,
    rating: 4.7,
    reviewCount: 59,
    compareAtPrice: 6750,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export { formatPKR as formatPrice } from "@/config/store";
