import { bundles, getBundleOriginalPrice } from "@/data/bundles";
import { products } from "@/data/products";
import { getCustomBundle } from "@/data/bundleRules";
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
) {
  const cb = getCustomBundle(custom);
  const productSubtotal = products.reduce(
    (sum, product) => sum + product.price * (items[product.slug] ?? 0),
    0,
  );
  const bundleOriginal = bundles.reduce(
    (sum, bundle) => sum + getBundleOriginalPrice(bundle) * (bundleItems[bundle.slug] ?? 0),
    0,
  );
  const bundleSubtotal = bundles.reduce(
    (sum, bundle) => sum + bundle.price * (bundleItems[bundle.slug] ?? 0),
    0,
  );
  const subtotal = productSubtotal + bundleSubtotal + cb.price;
  const bundleDiscount = bundleOriginal - bundleSubtotal;
  const customDiscount = cb.discount;
  const couponDiscount = Math.round(subtotal * getCouponRate(coupon));
  const discount = bundleDiscount + customDiscount + couponDiscount;
  const afterCoupon = subtotal - couponDiscount;
  const shipping = getShipping(afterCoupon);
  return {
    customDiscount,
    customPrice: cb.price,
    customCount: cb.count,
    productSubtotal,
    bundleOriginal,
    bundleSubtotal,
    subtotal,
    bundleDiscount,
    couponDiscount,
    discount,
    shipping,
    total: afterCoupon + shipping,
  };
}
