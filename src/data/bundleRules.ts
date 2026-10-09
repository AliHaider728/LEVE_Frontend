import { products } from "@/data/products";

/** Custom bundle discount tiers. minItems = total units selected. Edit here only. */
export const bundleTiers = [
  { minItems: 2, rate: 0.1 },
  { minItems: 3, rate: 0.2 },
] as const;

export function getCustomBundle(selection: Record<string, number>) {
  const count = Object.values(selection).reduce((a, b) => a + b, 0);
  const original = products.reduce((sum, p) => sum + p.price * (selection[p.slug] ?? 0), 0);
  const tier = [...bundleTiers].reverse().find((t) => count >= t.minItems);
  const rate = tier?.rate ?? 0;
  const discount = Math.round(original * rate);
  const next = bundleTiers.find((t) => count < t.minItems);
  return {
    count,
    original,
    rate,
    discount,
    price: original - discount,
    next: next ? { need: next.minItems - count, rate: next.rate } : null,
  };
}
