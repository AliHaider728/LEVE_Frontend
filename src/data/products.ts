export type Product = {
  id?: string;
  sku?: string;
  category?: string;
  variationId?: string;
  selectedAttributes?: Record<string, string>;
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

const R2_BASE = "https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev";

const creamImages = [
  `${R2_BASE}/images/brightening-cream-main.webp`,
  `${R2_BASE}/images/brightening-cream-model.webp`,
  `${R2_BASE}/images/brightening-cream-hand.webp`,
];
const sunscreenImages = [
  `${R2_BASE}/images/tinted-sunscreen-main.webp`,
  `${R2_BASE}/images/tinted-sunscreen-model.webp`,
  `${R2_BASE}/images/tinted-sunscreen-studio.webp`,
];
const washImages = [
  `${R2_BASE}/images/face-wash-main.webp`,
  `${R2_BASE}/images/face-wash-model.webp`,
  `${R2_BASE}/images/face-wash-ritual.webp`,
];

export const products: Product[] = [
  {
    slug: "product-01",
    number: "01",
    name: "LEVA Cream",
    sku: "LEV-CRM30",
    category: "Creams & Moisturizers",
    ritual: "Step 02 · The Nourishing Veil",
    price: 1650,
    size: "30 G",
    description:
      "LEVA Cream is an indulgent yet fast-absorbing daily moisturizing and brightening cream. Enriched with ceramides, hyaluronic acid, and nourishing botanical extracts, it works deeply to replenish lost moisture, soothe environmental stress, and brighten dull skin. It locks in long-lasting hydration, leaving your complexion soft, plump, and luminous throughout the day.",
    ingredients:
      "Aqua, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Niacinamide, Ceramide NP, Sodium Hyaluronate, Alpha Arbutin, Licorice Root Extract, Shea Butter, Vitamin E (Tocopherol), Dimethicone, Glycerin, Phenoxyethanol, Ethylhexylglycerin.",
    usage:
      "Take a dime-sized amount and warm between fingertips. Smooth evenly over cleansed face and neck in gentle upward circular motions until fully absorbed. Use morning and evening as Step 02 of your ritual.",
    benefit: "Deeply hydrates, repairs the moisture barrier, and enhances luminous radiance for soft, glowing skin.",
    faq:
      "Is LEVA Cream suitable for oily or sensitive skin? Yes, the formula is lightweight and non-comedogenic, absorbing quickly without clogging pores or feeling greasy. Suitable for dry, normal, combination, and sensitive skin.",
    image: creamImages[0],
    hoverImage: creamImages[0],
    galleryImages: creamImages,
    badge: "Best Seller",
    type: "Cream",
    concerns: ["Dullness", "Uneven tone", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination"],
    addedAt: "2026-06-01",
    stock: 18,
    rating: 5.0,
    reviewCount: 20,
    compareAtPrice: 2100,
  },
  {
    slug: "product-02",
    number: "02",
    name: "LEVA Tinted Sunblock",
    sku: "LEV-TSPF50",
    category: "Sunblock & Sunscreen",
    ritual: "Step 03 · The Daily Shield",
    price: 1500,
    size: "SPF 50 · PA+++ (50 ML)",
    description:
      "LEVA Tinted Sunblock delivers broad-spectrum SPF 50 PA+++ protection against harmful UVA and UVB rays while infusing the skin with a lightweight, universal tint. It seamlessly blurs minor imperfections, redness, and uneven skin tone, leaving a natural dewy finish without any sticky residue or white cast. Designed for everyday wear in Pakistan's climate, it serves as your daily sun defense and effortless no-makeup skin tint in one.",
    ingredients:
      "Aqua, Zinc Oxide, Titanium Dioxide, Ethylhexyl Methoxycinnamate, Niacinamide, Sodium Hyaluronate, Vitamin E (Tocopherol), Cyclopentasiloxane, Iron Oxides (Natural Mineral Tint), Silica, Glycerin, Phenoxyethanol, Ethylhexylglycerin.",
    usage:
      "Apply generously and evenly to face, neck, and exposed skin 15 minutes before sun exposure. Gently blend with fingertips or a beauty sponge. Reapply every 2 hours, or after sweating or towel drying. Can be worn alone or as a primer under makeup.",
    benefit: "Broad-spectrum SPF 50 PA+++ protection with a sheer universal tint for a radiant, non-greasy finish without white cast.",
    faq:
      "Will it leave a white cast or feel heavy? No, LEVA Tinted Sunblock uses micronized mineral filters with a sheer universal tint that blends naturally across Pakistani skin tones with an oil-free, weightless feel.",
    image: sunscreenImages[0],
    hoverImage: sunscreenImages[0],
    galleryImages: sunscreenImages,
    badge: "New",
    type: "Sunscreen",
    concerns: ["Dullness", "Dryness"],
    skinTypes: ["Dry", "Normal", "Combination", "Oily"],
    addedAt: "2026-09-15",
    stock: 12,
    rating: 4.9,
    reviewCount: 25,
    compareAtPrice: 1900,
  },
  {
    slug: "product-03",
    number: "03",
    name: "LEVA Face Wash",
    sku: "LEV-FW145",
    category: "Face Wash & Cleansers",
    ritual: "Step 01 · The Cleanse",
    price: 1450,
    size: "145 ML",
    description:
      "LEVA Face Wash is a gentle, refreshing daily facial cleanser formulated to purify and revitalize the skin. It effectively removes dirt, excess oil, pollution, and impurities while respecting the skin's natural moisture barrier. Enriched with soothing botanicals, niacinamide, and pro-vitamin B5, it leaves your skin soft, thoroughly clean, and balanced without any tightness or dryness.",
    ingredients:
      "Aqua, Glycerin, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Niacinamide, Panthenol (Pro-Vitamin B5), Aloe Barbadensis Leaf Juice, Allantoin, Chamomile Extract, Citric Acid, Phenoxyethanol, Ethylhexylglycerin.",
    usage:
      "Dispense 1-2 pumps onto damp hands and work into a gentle lather. Massage gently over face and neck in circular motions for 30–60 seconds, avoiding the eye area. Rinse thoroughly with lukewarm water and pat dry. Use morning and night as Step 01 of your ritual.",
    benefit: "A gentle, purifying daily face wash that cleanses pores deeply without stripping moisture, leaving skin fresh and revitalized.",
    faq:
      "Is LEVA Face Wash suitable for daily use on acne-prone or sensitive skin? Yes, it is soap-free, sulfate-free, and formulated at skin-friendly pH. It cleanses deeply while keeping the skin barrier calm and hydrated.",
    image: washImages[0],
    hoverImage: washImages[0],
    galleryImages: washImages,
    badge: "Limited Stock",
    type: "Cleanser",
    concerns: ["Sensitivity"],
    skinTypes: ["Oily", "Combination", "Normal", "Sensitive"],
    addedAt: "2026-07-20",
    stock: 7,
    rating: 4.9,
    reviewCount: 30,
    compareAtPrice: 1800,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export { formatPKR as formatPrice } from "@/config/store";
