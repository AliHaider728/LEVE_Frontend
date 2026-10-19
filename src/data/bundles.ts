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
    description: "A complete three-step LEVA ritual: cleanse with LEVA Face Wash, care with LEVA Cream, then finish with LEVA Tinted Sunblock SPF 50 PA+++.",
    image: "/images/leva-complete-ritual-bundle.webp",
    productSlugs: ["product-01", "product-02", "product-03"],
    price: 3680,
    savePercent: 20,
  },
  {
    slug: "the-essentials",
    name: "The Duo",
    description: "The LEVA Cream and LEVA Tinted Sunblock, paired for a daytime ritual.",
    productSlugs: ["product-01", "product-02"],
    price: 2835,
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
