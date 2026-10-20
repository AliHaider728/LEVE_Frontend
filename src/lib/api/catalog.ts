import { products as localProducts, type Product } from "@/data/products";
import { bundles as localBundles, type Bundle } from "@/data/bundles";
import { type Review } from "@/data/reviews";
import { storeConfig } from "@/config/store";
import { apiRequest, ApiError } from "./client";

import { validateRoutineSettings, type RoutineDiscountSettings } from "@/lib/routine-discount";
type Row = Record<string, unknown>;
export type StoreSettings = Omit<typeof storeConfig, "shippingFlatRate" | "freeShippingThreshold" | "phone" | "email" | "whatsappNumber"> & {
  shippingFlatRate: number; freeShippingThreshold: number; phone: string; email: string; whatsappNumber: string; routineDiscount?: RoutineDiscountSettings;
};
const object = (value: unknown): Row => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const text = (value: unknown, fallback = ""): string => typeof value === "string" && value.trim() ? value.replace(/<[^>]*>/g, " ").trim() : fallback;
const number = (value: unknown, fallback = 0): number => value !== null && value !== "" && Number.isFinite(Number(value)) ? Number(value) : fallback;
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const enabled = (value: unknown) => value === true || value === 1 || value === "1";
const image = (value: unknown, fallback: string): string => {
  const url = text(value);
  return /^(https?:\/\/|\/(?!\/))/.test(url) ? url : fallback;
};

/** Keep the three storefront slots stable so saved carts and product URLs survive refreshes. */
export function normalizeProducts(payload: unknown): Product[] {
  if (!Array.isArray(payload)) throw new ApiError("Product data was unavailable.", 0, "invalid-response");
  const rows = payload.map(object).filter(row => text(row.id) && text(row.name) && number(row.price, -1) >= 0 && row.productType !== "bundle" && row.isVisible !== false && row.isVisible !== 0 && row.status !== "draft").slice(0, 3);
  if (!rows.length) throw new ApiError("Product data was unavailable.", 0, "invalid-response");
  const remaining = [...rows];
  return localProducts.map((fallback, index) => {
    const matching = remaining.findIndex(row => row.slug === fallback.slug || text(row.name).toLowerCase() === fallback.name.toLowerCase());
    const row = remaining.splice(matching >= 0 ? matching : 0, 1)[0];
    if (!row) return fallback;
    const categories = list(row.categoryNames).map(String).join(" ");
    const label = (text(row.name) + " " + categories).toLowerCase();
    const type = /sunscreen|sun screen|spf/.test(label) ? "Sunscreen" : /cleanser|wash|balm/.test(label) ? "Cleanser" : /cream|moisturi/.test(label) ? "Cream" : fallback.type;
    const images = list(row.images);
    const thumbnail = list(row.imageThumbnailUrls)[0] ?? images[0];
    const mainImage = image(thumbnail, fallback.image);
    const galleryImages = [mainImage, ...images.map(value => image(value, mainImage))]
      .filter((value, index, all) => all.indexOf(value) === index);
    const stock = enabled(row.inStock) ? enabled(row.trackInventory) ? Math.max(0, number(row.stockQuantity)) : 9999 : 0;
    const variations = list(row.variations).map(object);
    const variant = variations.find(value => value.id === row.defaultVariationId && enabled(value.enabled));
    const price = row.productType === "variable" && variant ? number(variant.salePrice ?? variant.regularPrice, number(row.price)) : number(row.price);
    const specs = object(row.specifications);
    const ingredients = text(specs.Ingredients, fallback.ingredients);
    const usage = text(specs.Usage, fallback.usage);
    const faq = text(specs.FAQ, fallback.faq);
    const size = text(specs.Size, fallback.size);
    const categoryName = list(row.categoryNames)[0];
    const category = text(categoryName, fallback.category);
    const sku = text(row.sku, fallback.sku);
    return {
      ...fallback, id: text(row.id), slug: text(row.slug, fallback.slug), number: String(index + 1).padStart(2, "0"), name: text(row.name, fallback.name), type,
      sku, category, size, ingredients, usage, faq,
      price, compareAtPrice: Math.max(price, number(row.originalPrice, price)), stock,
      variationId: variant ? text(variant.id) : undefined, selectedAttributes: variant ? Object.fromEntries(Object.entries(object(variant.attributes)).map(([name,value])=>[name,String(value)])) : undefined, requiresVariation: row.productType === "variable" && !variant,
      description: text(row.description, fallback.description), benefit: text(row.shortDescription, fallback.benefit),
      image: mainImage, hoverImage: mainImage, galleryImages,
      rating: number(row.rating), reviewCount: number(row.reviewCount), addedAt: text(row.createdAt, fallback.addedAt),
      badge: stock === 0 ? "Sold Out" : enabled(row.isBestseller) ? "Best Seller" : enabled(row.isNewArrival) ? "New" : stock < 5 ? "Limited Stock" : fallback.badge,
    };
  });
}

export function normalizeBundles(payload: unknown, products: Product[]): Bundle[] {
  const source = object(payload).bundles;
  if (!Array.isArray(source)) throw new ApiError("Bundle data was unavailable.", 0, "invalid-response");
  const rows = source.map(object);
  // An empty collection is a valid live response. Treating it as an API error
  // made the storefront log a false failure and then display stale local bundles.
  if (!rows.length) return [];
  const bundles = rows.filter(row => text(row.id) && row.isActive !== false && row.isActive !== 0).flatMap((row, index) => {
    const entries = list(row.products).map(object);
    const productSlugs = entries.flatMap(entry => {
      const product = products.find(p => p.id === entry.id);
      const quantity = Math.max(1, Math.min(100, Math.floor(number(entry.bundle_quantity, 1))));
      return product ? Array.from({ length: quantity }, () => product.slug) : [];
    });
    if (!entries.length || productSlugs.length !== entries.reduce((sum, entry) => sum + Math.max(1, Math.min(100, Math.floor(number(entry.bundle_quantity, 1)))), 0)) return [];
    const isCompleteRitual = productSlugs.length === 3 && localProducts.every(product => productSlugs.includes(product.slug));
    return [{ id: text(row.id), slug: text(row.slug, localBundles[index]?.slug ?? "bundle-" + index), name: text(row.name, "LEVA Bundle"),
      description: text(row.description) || (isCompleteRitual ? localBundles[0].description : ''),
      image: (text(row.slug) === 'the-essentials' || text(row.name).toLowerCase().includes('duo') || productSlugs.length === 2) ? '' : image(row.image ?? row.customImage, (isCompleteRitual ? localBundles[0].image : '') ?? ''), productSlugs,
      price: number(row.currentPrice), originalPrice: number(row.originalTotalPrice), savePercent: number(row.originalTotalPrice) > 0 ? Math.round((1 - number(row.currentPrice) / number(row.originalTotalPrice)) * 100) : 0 }];
  });
  if (rows.length && !bundles.length) throw new ApiError("Bundle data was unavailable.", 0, "invalid-response");
  return bundles;
}

export function normalizeSettings(payload: unknown): StoreSettings {
  const row = object(payload);
  if (!("standardShippingFee" in row) || !("freeShippingThreshold" in row)) throw new ApiError("Delivery details were unavailable.", 0, "invalid-response");
  const phone = text(row.phone, storeConfig.phone);
  return { ...storeConfig, ...(row.routineDiscount ? { routineDiscount: validateRoutineSettings(row.routineDiscount) } : {}), shippingFlatRate: Math.max(0, number(row.standardShippingFee, storeConfig.shippingFlatRate)),
    freeShippingThreshold: Math.max(0, number(row.freeShippingThreshold, storeConfig.freeShippingThreshold)), phone,
    email: text(row.email, storeConfig.email), whatsappNumber: storeConfig.whatsappNumber };
}

export const catalogApi = {
  listProducts: async () => normalizeProducts(await apiRequest<unknown>("/api/products?limit=3")),
  listBundles: async (products: Product[]) => normalizeBundles(await apiRequest<unknown>("/api/bundles"), products),
  submitReview: (input: { productId: string; productName: string; reviewerName: string; rating: number; content: string }) => apiRequest<{ message: string }>("/api/reviews", { method: "POST", body: JSON.stringify(input) }),
  settings: async () => normalizeSettings(await apiRequest<unknown>("/api/settings")),
  reviews: async (products: Product[]): Promise<Review[]> => {
    const results = await Promise.all(products.filter(p => p.id).map(async product => {
      const payload = await apiRequest<unknown>("/api/reviews/product/" + encodeURIComponent(product.id!));
      if (!Array.isArray(payload)) throw new ApiError("Reviews were unavailable.", 0, "invalid-response");
      return payload.map(object).map(row => ({ name: text(row.reviewerName, "LEVA customer"), city: text(row.city), rating: Math.max(1, Math.min(5, number(row.rating, 5))), quote: text(row.content), product: text(row.productName, product.name), verified: enabled(row.verifiedPurchase) })).filter(review => review.quote);
    }));
    return results.flat();
  },
};
