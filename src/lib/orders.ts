export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank";

export type LocalOrder = {
  orderNumber: string;
  createdAt: string;
  customer: { fullName: string; mobile: string; email?: string };
  address: {
    street: string;
    area?: string;
    city: string;
    province: string;
    postalCode?: string;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
  transactionId?: string;
  items: Array<{ name: string; quantity: number; total: number }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: "Order placed" | "Payment pending verification";
};

const STORAGE_KEY = "leva-orders";

export function saveOrder(order: LocalOrder) {
  if (typeof window === "undefined") return;
  const existing = readOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
}

export function readOrders(): LocalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

export function getOrder(orderNumber: string) {
  return readOrders().find((order) => order.orderNumber === orderNumber);
}

export function createOrderNumber() {
  const max = readOrders().reduce(
    (m, o) => Math.max(m, Number(o.orderNumber.replace("LEVA-", "")) || 0),
    10000,
  );
  return `LEVA-${max + 1}`;
}
