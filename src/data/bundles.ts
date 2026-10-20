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
    image: "https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/leva-complete-ritual-bundle.webp",
    productSlugs: ["leva-face-wash", "leva-cream", "leva-tinted-sunblock"],
    price: 3910,
    savePercent: 15,
  },
  {
    slug: "the-essentials",
    name: "The Duo",
    description: "The LEVA Cream and LEVA Tinted Sunblock, paired for a daytime ritual.",
    productSlugs: ["leva-cream", "leva-tinted-sunblock"],
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
