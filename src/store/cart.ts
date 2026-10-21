import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
  items: Record<string, number>;
  bundles: Record<string, number>;
  open: boolean;
  coupon: string;
  custom: Record<string, number>;
  setCustom: (selection: Record<string, number>) => void;
  clearCustom: () => void;
  setCoupon: (coupon: string) => void;
  buyNow: (slug: string, quantity?: number) => void;
  setOpen: (open: boolean) => void;
  add: (slug: string) => void;
  addMany: (slug: string, quantity: number) => void;
  addBundle: (slug: string) => void;
  decrementBundle: (slug: string) => void;
  removeBundle: (slug: string) => void;
  remove: (slug: string) => void;
  decrement: (slug: string) => void;
  clear: () => void;
};

if (typeof window !== "undefined") {
  try {
    const legacyKeys = ["leva-catalog", "catalog-cache", "leva_catalog", "leva-products", "cached-products"];
    for (const key of legacyKeys) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      bundles: {},
      open: false,
      coupon: "",
      custom: {},
      setCustom: (selection) =>
        set({
          custom: Object.fromEntries(Object.entries(selection).filter(([, q]) => q > 0)),
          open: true,
        }),
      clearCustom: () => set({ custom: {} }),
      setCoupon: (coupon) => set({ coupon }),
      buyNow: (slug, quantity = 1) =>
        set((state) => ({
          items: { ...state.items, [slug]: Math.max(state.items[slug] ?? 0, quantity) },
          open: false,
        })),
      setOpen: (open) => set({ open }),
      add: (slug) =>
        set((state) => ({
          items: { ...state.items, [slug]: (state.items[slug] ?? 0) + 1 },
          open: true,
        })),
      addMany: (slug, quantity) =>
        set((state) => ({
          items: { ...state.items, [slug]: (state.items[slug] ?? 0) + quantity },
          open: true,
        })),
      addBundle: (slug) =>
        set((state) => ({
          bundles: { ...state.bundles, [slug]: (state.bundles[slug] ?? 0) + 1 },
          open: true,
        })),
      decrementBundle: (slug) =>
        set((state) => {
          const quantity = state.bundles[slug] ?? 0;
          const next = { ...state.bundles };
          if (quantity <= 1) delete next[slug];
          else next[slug] = quantity - 1;
          return { bundles: next };
        }),
      removeBundle: (slug) =>
        set((state) => {
          const next = { ...state.bundles };
          delete next[slug];
          return { bundles: next };
        }),
      remove: (slug) =>
        set((state) => {
          const next = { ...state.items };
          delete next[slug];
          return { items: next };
        }),
      decrement: (slug) =>
        set((state) => {
          const quantity = state.items[slug] ?? 0;
          if (quantity <= 1) {
            const next = { ...state.items };
            delete next[slug];
            return { items: next };
          }
          return { items: { ...state.items, [slug]: quantity - 1 } };
        }),
      clear: () => set({ items: {}, bundles: {}, custom: {}, open: false, coupon: "" }),
    }),
    {
      name: "leva-cart",
      version: 2,
      migrate: (stored) => {
        const old = (stored ?? {}) as Record<string, unknown>;
        const lines = (value: unknown): Record<string, number> => Object.fromEntries(
          Object.entries(value && typeof value === 'object' ? value : {}).filter(
            ([, quantity]) => typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0 && quantity <= 100,
          ),
        );
        return { items: lines(old.items), bundles: lines(old.bundles), custom: lines(old.custom), coupon: typeof old.coupon === 'string' ? old.coupon : '' };
      },
      partialize: ({ items, bundles, coupon, custom }) => ({ items, bundles, coupon, custom }),
    },
  ),
);
