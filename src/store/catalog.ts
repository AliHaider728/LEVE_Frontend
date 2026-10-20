"use client";
import { create } from "zustand";
import { products as localProducts, type Product } from "@/data/products";
import { bundles as localBundles, type Bundle } from "@/data/bundles";
import { reviews as localReviews, type Review } from "@/data/reviews";
import { storeConfig } from "@/config/store";
import { API_URL, ApiError } from "@/lib/api/client";
import { catalogApi, type StoreSettings } from "@/lib/api/catalog";

type StoreData = {
  products: Product[]; bundles: Bundle[]; reviews: Review[]; settings: StoreSettings;
  loading: boolean; ready: boolean; notice: string; reviewsLive: boolean;
  load: () => Promise<void>;
};
export const useStoreData = create<StoreData>((set, get) => ({
  products: localProducts, bundles: localBundles, reviews: localReviews, settings: storeConfig,
  loading: false, ready: false, notice: "", reviewsLive: false,
  load: async () => {
    if (get().loading || get().ready) return;
    if (!API_URL) { set({ ready: true }); return; }
    set({ loading: true, notice: "" });
    const [catalog, settings] = await Promise.allSettled([catalogApi.listProducts(), catalogApi.settings()]);
    const products = catalog.status === "fulfilled" ? catalog.value : localProducts;
    const [bundles, reviews] = await Promise.allSettled([catalogApi.listBundles(products), catalog.status === "fulfilled" ? catalogApi.reviews(products) : Promise.reject(new Error("Catalog unavailable"))]);
    for (const [source, result] of Object.entries({ products: catalog, settings, bundles, reviews })) {
      if (result.status === "rejected") {
        const error = result.reason;
        console.warn("[LEVA store] Live " + source + " request failed", error instanceof ApiError ? { code: error.code, status: error.status } : { code: "unexpected" });
      }
    }
    // Reviews have their own fallback and do not affect product availability.
    const fallback = [catalog, settings, bundles].some(result => result.status === "rejected") || products.some(product => !product.id);
    set({ products, settings: settings.status === "fulfilled" ? settings.value : storeConfig,
      bundles: bundles.status === "fulfilled" ? bundles.value : localBundles,
      reviews: (reviews.status === "fulfilled" && Array.isArray(reviews.value) && reviews.value.length > 0) ? reviews.value : localReviews,
      reviewsLive: reviews.status === "fulfilled" && Array.isArray(reviews.value) && reviews.value.length > 0, loading: false, ready: true,
      notice: fallback ? "Some live store details are unavailable. You can still browse our saved collection. Checkout will confirm availability with the store." : "" });
  },
}));
