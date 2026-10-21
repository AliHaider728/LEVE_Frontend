import { calculateRoutineDiscount, type RoutineDiscountSettings } from "@/lib/routine-discount";
import type { Product } from "@/data/products";

/** Custom bundle discount tiers. minItems = total units selected. Edit here only. */
export const bundleTiers = [
  { minItems: 2, rate: 0.1 },
  { minItems: 3, rate: 0.15 },
] as const;

export function getCustomBundle(selection: Record<string, number>, catalog: Product[] = [], settings?: RoutineDiscountSettings) {
  const count = Object.values(selection).reduce((a, b) => a + b, 0);
  const original = catalog.reduce((sum, p) => sum + p.price * (selection[p.slug] ?? 0), 0);
  const live = settings ? calculateRoutineDiscount(catalog.filter(p => selection[p.slug] > 0).map(p => ({ productId: p.id ?? p.slug, quantity: selection[p.slug], unitPrice: p.price })), settings) : undefined;
  const tier = [...bundleTiers].reverse().find((t) => count >= t.minItems);
  const rate = live ? live.percent / 100 : tier?.rate ?? 0;
  const discount = Math.round(original * rate);
  const distinct = Object.values(selection).filter(quantity => quantity > 0).length;
  const next = settings ? settings.tiers.map(t => ({ minItems: t.minProducts, rate: t.discountPercent / 100 })).find(t => distinct < t.minItems) : bundleTiers.find(t => count < t.minItems);
  return {
    count,
    original,
    rate,
    discount,
    price: original - discount,
    next: next ? { need: next.minItems - (settings ? distinct : count), rate: next.rate } : null,
  };
}
