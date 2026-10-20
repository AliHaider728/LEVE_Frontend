import { bundles } from "@/data/bundles";
import { products } from "@/data/products";
import { getCustomBundle } from "@/data/bundleRules";
import type { StoreSettings } from "@/lib/api/catalog";
import type { Product } from "@/data/products";
import type { Bundle } from "@/data/bundles";
import { getShipping, storeConfig } from "@/config/store";

export function getCouponRate(code: string | undefined) {
  if (!code) return 0;
  return storeConfig.coupons[code.trim().toUpperCase() as keyof typeof storeConfig.coupons] ?? 0;
}

export function getCartTotals(
  items: Record<string, number>,
  bundleItems: Record<string, number>,
  coupon?: string,
  custom: Record<string, number> = {},
  data: { products: Product[]; bundles: Bundle[]; settings: StoreSettings } = { products, bundles, settings: storeConfig },
) {
  const cb = getCustomBundle(custom, data.products, data.settings.routineDiscount);
  const productSubtotal = data.products.reduce(
    (sum, product) => sum + product.price * (items[product.slug] ?? 0),
    0,
  );
  const bundleSubtotal = data.bundles.reduce(
    (sum, bundle) => sum + bundle.price * (bundleItems[bundle.slug] ?? 0),
    0,
  );
  const subtotal = productSubtotal + bundleSubtotal + cb.original;
  const customDiscount = cb.discount;
  const couponDiscount = Math.round(productSubtotal * getCouponRate(coupon));
  const discount = customDiscount + couponDiscount;
  const afterCoupon = Math.max(0, productSubtotal - couponDiscount) + bundleSubtotal + cb.price;
  const shipping = getShipping(afterCoupon, data.settings);
  return {
    customDiscount,
    customDiscountRate: cb.rate,
    customPrice: cb.price,
    customCount: cb.count,
    productSubtotal,
    bundleOriginal: bundleSubtotal,
    bundleSubtotal,
    subtotal,
    payableSubtotal: afterCoupon,
    bundleDiscount: 0,
    couponDiscount,
    discount,
    shipping,
    total: afterCoupon + shipping,
  };
}
