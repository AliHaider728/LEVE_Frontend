import { products } from "@/data/products";

export type Bundle = {
  id?: string;
  originalPrice?: number;
  slug: string;
  name: string;
  description: string;
  image?: string;
  productSlugs: string[];
  price: number;
  savePercent: number;
};

export const bundles: Bundle[] = [
  {
    slug: "complete-ritual",
    name: "The Complete Ritual",
    description: "A complete three-step LEVA ritual: cleanse with Skin Brightening Face Wash, care with Skin Brightening Cream, then finish with Tinted Sunscreen SPF 50 PA+++.",
    image: "/images/leva-complete-ritual-bundle.webp",
    productSlugs: ["product-01", "product-02", "product-03"],
    price: 16080,
    savePercent: 20,
  },
  {
    slug: "the-essentials",
    name: "The Duo",
    description: "The brightening cream and tinted sunscreen, paired for a daytime ritual.",
    productSlugs: ["product-01", "product-02"],
    price: 13230,
    savePercent: 10,
  },
];

export function getBundleOriginalPrice(bundle: Bundle, catalog = products) {
  if (bundle.originalPrice !== undefined) return bundle.originalPrice;
  return bundle.productSlugs.reduce(
    (total, slug) => total + (catalog.find((product) => product.slug === slug)?.price ?? 0),
    0,
  );
}
