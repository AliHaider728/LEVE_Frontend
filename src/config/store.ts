export const storeConfig = {
  currency: "PKR",
  currencyLabel: "Rs.",
  shippingFlatRate: 250,
  freeShippingThreshold: 3000,
  deliveryEstimate: "3 to 5 working days",
  phone: "+92 300 0000000",
  whatsappNumber: "923000000000",
  email: "hello@leva.pk",
  jazzCash: { number: "+92 300 0000000", accountTitle: "LEVA (placeholder)" },
  easypaisa: { number: "+92 300 0000000", accountTitle: "LEVA (placeholder)" },
  coupons: { LEVA10: 0.1 } as Record<string, number>,
  bank: {
    name: "Bank name (placeholder)",
    accountTitle: "LEVA (placeholder)",
    iban: "PK00 LEVA 0000 0000 0000",
  },
} as const;

export function formatPKR(value: number) {
  return `${storeConfig.currencyLabel} ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value)}`;
}

export function getShipping(subtotal: number) {
  return subtotal >= storeConfig.freeShippingThreshold || subtotal === 0
    ? 0
    : storeConfig.shippingFlatRate;
}

export function getFreeShippingRemaining(subtotal: number) {
  return Math.max(0, storeConfig.freeShippingThreshold - subtotal);
}
