import { apiRequest, ApiError } from "./client";
import type { Product } from "@/data/products";
import type { Bundle } from "@/data/bundles";
import type { LocalOrder } from "@/lib/orders";

export type CheckoutDetails = { fullName: string; mobile: string; email: string; street: string; city: string; province: string; notes: string };
export type OrderItemInput = { productId: string; quantity: number; variationId?: string; productType?: "bundle"; isRoutine?: true };
export type CheckoutPayload = {
  customerName: string; phone: string; email: string; city: string;
  shippingAddress: { fullName: string; phone: string; street: string; city: string; province: string; notes: string };
  items: OrderItemInput[]; appliedCoupon?: { code: string }; checkoutRequestId: string;
};
export function buildCheckoutPayload(details: CheckoutDetails, cart: { items: Record<string, number>; bundles: Record<string, number>; custom: Record<string, number>; coupon: string }, catalog: { products: Product[]; bundles: Bundle[] }, requestId: string): CheckoutPayload {
  const items: OrderItemInput[] = [];
  const add = (selection: Record<string, number>, kind: "product" | "bundle" | "routine") => {
    for (const [slug, quantity] of Object.entries(selection)) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) throw new ApiError("Please check the quantities in your cart.", 0, "invalid-response");
      const entry = kind === "bundle" ? catalog.bundles.find(b => b.slug === slug) : catalog.products.find(p => p.slug === slug);
      if (!entry?.id) throw new ApiError("We couldn't confirm availability for your selection. Please refresh the page and try again.", 0, "network");
      if ("requiresVariation" in entry && entry.requiresVariation) throw new ApiError("Please choose a product option before placing your order.", 0, "invalid-response");
      items.push({ productId: entry.id, quantity, ...(kind === "bundle" ? { productType: "bundle" as const } : {}), ...(kind === "routine" ? { isRoutine: true as const } : {}), ...("variationId" in entry && entry.variationId ? { variationId: entry.variationId } : {}) });
    }
  };
  add(cart.items, "product"); add(cart.bundles, "bundle"); add(cart.custom, "routine");
  if (!items.length) throw new ApiError("Your cart is empty.", 0, "invalid-response");
  return { customerName: details.fullName, phone: details.mobile, email: details.email, city: details.city,
    shippingAddress: { fullName: details.fullName, phone: details.mobile, street: details.street, city: details.city, province: details.province, notes: details.notes },
    items, ...(cart.coupon.trim() ? { appliedCoupon: { code: cart.coupon.trim().toUpperCase() } } : {}), checkoutRequestId: requestId };
}

type ServerOrder = { orderId: string; createdAt: string; subtotal: number; discountAmount: number; shippingFee: number; total: number; status: string; items: Array<{ productName?: string; name?: string; quantity: number; price: number }> };
export async function placeOrder(payload: CheckoutPayload, details: CheckoutDetails): Promise<LocalOrder> {
  let response: ServerOrder;
  try { response = await apiRequest<ServerOrder>("/api/orders", { method: "POST", body: JSON.stringify(payload) }); }
  catch (error) {
    if (error instanceof ApiError && /savings or prices have changed|routine prices/i.test(error.message)) throw new ApiError("The store couldn't confirm your discount. Your order wasn't placed. Please remove the coupon or custom bundle, or contact us on WhatsApp.", error.status, "http");
    throw error;
  }
  if (!response.orderId || !Array.isArray(response.items) || !Number.isFinite(Number(response.total))) throw new ApiError("We couldn't read your order confirmation. Please contact us before trying again.", 0, "invalid-response");
  return { orderNumber: response.orderId, createdAt: response.createdAt, customer: { fullName: details.fullName, mobile: details.mobile, email: details.email },
    address: { street: details.street, city: details.city, province: details.province, notes: details.notes }, paymentMethod: "cod",
    items: response.items.map(item => ({ name: item.productName ?? item.name ?? "LEVA item", quantity: Number(item.quantity), total: Number(item.price) * Number(item.quantity) })),
    subtotal: Number(response.subtotal), discount: Number(response.discountAmount), shipping: Number(response.shippingFee), total: Number(response.total), status: "Order placed" };
}
