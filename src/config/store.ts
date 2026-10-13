export const storeConfig = {
  currency: "PKR",
  currencyLabel: "Rs.",
  shippingFlatRate: 250,
  freeShippingThreshold: 3000,
  deliveryEstimate: "3 to 5 working days",
  phone: "+92 300 0000000",
  whatsappNumber: "923147080907",
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

export function getShipping(subtotal: number, settings: { freeShippingThreshold: number; shippingFlatRate: number } = storeConfig) {
  return subtotal >= settings.freeShippingThreshold || subtotal === 0
    ? 0
    : settings.shippingFlatRate;
}

export function getFreeShippingRemaining(subtotal: number, settings: { freeShippingThreshold: number } = storeConfig) {
  return Math.max(0, settings.freeShippingThreshold - subtotal);
}
