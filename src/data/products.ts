export type Product = {
  id?: string;
  variationId?: string;
  selectedAttributes?: Record<string,string>;
  requiresVariation?: boolean;
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
  galleryImages?: string[];
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

export type ProductType = "Cleanser" | "Sunscreen" | "Cream";
export type Concern = "Dullness" | "Dryness" | "Uneven tone" | "Sensitivity";
export type SkinType = "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive";
export const productTypes: ProductType[] = ["Cleanser", "Sunscreen", "Cream"];
export const concerns: Concern[] = ["Dullness", "Dryness", "Uneven tone", "Sensitivity"];

const creamImages = ["/images/brightening-cream-main.webp", "/images/brightening-cream-model.webp", "/images/brightening-cream-hand.webp"];
const sunscreenImages = ["/images/tinted-sunscreen-main.webp", "/images/tinted-sunscreen-model.webp", "/images/tinted-sunscreen-studio.webp"];
const washImages = ["/images/face-wash-main.webp", "/images/face-wash-model.webp", "/images/face-wash-ritual.webp"];

export const products: Product[] = [
  {
    slug: "product-01",
    number: "01",
    name: "LEVA Cream",
    ritual: "The first veil",
    price: 1650,
    size: "30 G",
    description: "LEVA Cream for a soft, radiant-looking finish.",
    ingredients: "See the product packaging for the complete ingredient list.",
    usage: "Use as directed on the product label.",
    benefit: "Helps brighten the look of dull skin.",
    faq: "See the product packaging for usage and safety information.",
    image: creamImages[0],
    hoverImage: creamImages[0],
    galleryImages: creamImages,
    badge: "Best Seller",
    type: "Cream",
    concerns: ["Dullness", "Uneven tone", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination"],
    addedAt: "2026-06-01",
    stock: 18,
    rating: 0,
    reviewCount: 0,
    compareAtPrice: 2100,
  },
  {
    slug: "product-02",
    number: "02",
    name: "LEVA Tinted Sunblock",
    ritual: "The daily shield",
    price: 1500,
    size: "SPF 50 · PA+++",
    description:
      "LEVA Tinted Sunblock with SPF 50 PA+++ and a lightweight, natural tint.",
    ingredients: "See the product packaging for the complete ingredient list.",
    usage: "Apply as directed on the product label.",
    benefit: "Broad-spectrum UVA/UVB protection with a natural tint.",
    faq: "Follow the directions on the product label for application and reapplication.",
    image: sunscreenImages[0],
    hoverImage: sunscreenImages[0],
    galleryImages: sunscreenImages,
    badge: "New",
    type: "Sunscreen",
    concerns: ["Dullness", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination", "Oily"],
    addedAt: "2026-09-15",
    stock: 12,
    rating: 0,
    reviewCount: 0,
    compareAtPrice: 1900,
  },
  {
    slug: "product-03",
    number: "03",
    name: "LEVA Face Wash",
    ritual: "The final touch",
    price: 1450,
    size: "145 ML",
    description:
      "LEVA Face Wash for a refreshing cleansing ritual.",
    ingredients: "See the product packaging for the complete ingredient list.",
    usage: "Use as directed on the product label.",
    benefit: "Cleanses and refreshes skin.",
    faq: "See the product packaging for usage and safety information.",
    image: washImages[0],
    hoverImage: washImages[0],
    galleryImages: washImages,
    badge: "Limited Stock",
    type: "Cleanser",
    concerns: ["Sensitivity"],
    skinTypes: ["Oily", "Combination", "Normal", "Sensitive"],
    addedAt: "2026-07-20",
    stock: 7,
    rating: 0,
    reviewCount: 0,
    compareAtPrice: 1800,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export { formatPKR as formatPrice } from "@/config/store";
