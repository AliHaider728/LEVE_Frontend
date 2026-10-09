import { products } from "@/data/products";

export type Bundle = {
  slug: string;
  name: string;
  description: string;
  productSlugs: string[];
  price: number;
  savePercent: number;
};

export const bundles: Bundle[] = [
  {
    slug: "complete-ritual",
    name: "The Complete Ritual",
    description: "All three LEVA essentials, brought together for a considered daily ritual.",
    productSlugs: ["product-01", "product-02", "product-03"],
    price: 16080,
    savePercent: 20,
  },
  {
    slug: "the-essentials",
    name: "The Duo",
    description: "The first veil and quiet reset, paired for day and night.",
    productSlugs: ["product-01", "product-02"],
    price: 13230,
    savePercent: 10,
  },
];

export function getBundleOriginalPrice(bundle: Bundle) {
  return bundle.productSlugs.reduce(
    (total, slug) => total + (products.find((product) => product.slug === slug)?.price ?? 0),
    0,
  );
}
