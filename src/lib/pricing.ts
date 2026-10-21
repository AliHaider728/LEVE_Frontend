import { formatPKR } from "@/config/store";

export type PriceDisplay = {
  price: number;
  compareAtPrice: number | null;
  hasDiscount: boolean;
  discountPercent: number;
  saveBadgeText: string | null;
  formattedPrice: string;
  formattedCompareAtPrice: string | null;
};

export type StockDisplay = {
  inStock: boolean;
  isLowStock: boolean;
  stockText: string;
  badge: { text: string; variant: "stock" | "sold" | "default" } | null;
};

/**
 * Shared price helper used across all views: detail page, cards, shop, search, bundles, cart, checkout.
 * Rule: Single products are NOT discounted by default.
 * A sale price counts ONLY if compareAtPrice (or originalPrice) is a number > 0 and strictly greater than price.
 * Otherwise, returns a single price: no struck-through price, no "SAVE x%", no "0%".
 */
export function getPriceDisplay(product?: {
  price?: number | null;
  compareAtPrice?: number | null;
  originalPrice?: number | null;
} | null): PriceDisplay {
  const rawPrice = product?.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawCompare = product?.compareAtPrice ?? product?.originalPrice;
  const compareNum =
    typeof rawCompare === "number" && Number.isFinite(rawCompare)
      ? rawCompare
      : typeof rawCompare === "string" && Number.isFinite(Number(rawCompare))
      ? Number(rawCompare)
      : null;

  // A sale price counts only if compareAtPrice is strictly higher than selling price
  const hasDiscount = Boolean(compareNum !== null && compareNum > price && price > 0);
  const compareAtPrice = hasDiscount ? compareNum : null;
  const discountPercent =
    hasDiscount && compareAtPrice
      ? Math.max(1, Math.round(((compareAtPrice - price) / compareAtPrice) * 100))
      : 0;

  return {
    price,
    compareAtPrice,
    hasDiscount,
    discountPercent,
    saveBadgeText: hasDiscount ? `Save ${discountPercent}%` : null,
    formattedPrice: formatPKR(price),
    formattedCompareAtPrice: compareAtPrice ? formatPKR(compareAtPrice) : null,
  };
}

/**
 * Shared stock display helper. Single source of truth from database stock fields.
 * Returns:
 * - "In stock" (when in stock and inventory is healthy)
 * - "Only N left" (when tracking inventory and quantity is at or below threshold)
 * - "Out of stock" (when quantity is 0 or inStock is false)
 */
export function getStockDisplay(product?: {
  stock?: number | null;
  stockQuantity?: number | null;
  trackInventory?: boolean | number | null;
  inStock?: boolean | number | null;
  lowStockThreshold?: number | null;
  badge?: string | null;
} | null): StockDisplay {
  if (!product) {
    return { inStock: true, isLowStock: false, stockText: "In stock", badge: null };
  }

  const tracking = Boolean(product.trackInventory);
  const qty =
    tracking && typeof product.stockQuantity === "number"
      ? product.stockQuantity
      : typeof product.stock === "number" && product.stock < 9999
      ? product.stock
      : null;

  const isExplicitlyOut =
    product.inStock === false || product.inStock === 0 || product.badge === "Sold Out";
  const isZeroQty = tracking && qty !== null && qty <= 0;

  if (isExplicitlyOut || isZeroQty) {
    return {
      inStock: false,
      isLowStock: false,
      stockText: "Out of stock",
      badge: { text: "Sold Out", variant: "sold" },
    };
  }

  const threshold =
    typeof product.lowStockThreshold === "number" && product.lowStockThreshold >= 0
      ? product.lowStockThreshold
      : 5;

  if (tracking && qty !== null && qty > 0 && qty <= threshold) {
    return {
      inStock: true,
      isLowStock: true,
      stockText: `Only ${qty} left`,
      badge: { text: `Only ${qty} left`, variant: "stock" },
    };
  }

  // Promotional badge if set (e.g. Best Seller, New), ignoring any stale "Limited Stock"
  let promoBadge: { text: string; variant: "stock" | "sold" | "default" } | null = null;
  if (product.badge && product.badge !== "Limited Stock" && product.badge !== "Sold Out") {
    promoBadge = { text: product.badge, variant: "default" };
  }

  return {
    inStock: true,
    isLowStock: false,
    stockText: "In stock",
    badge: promoBadge,
  };
}
