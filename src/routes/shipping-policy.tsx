"use client";
import { createFileRoute } from "@/lib/router-compat";
import { storeConfig, formatPKR } from "@/config/store";
export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — LEVA Pakistan" },
      { name: "description", content: "LEVA Pakistan shipping rates and delivery estimates." },
      { property: "og:title", content: "Shipping Policy — LEVA" },
      { property: "og:description", content: "Delivery information for LEVA Pakistan orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <Policy title="Shipping Policy">
      <p>
        We deliver across Pakistan. Standard delivery is {formatPKR(storeConfig.shippingFlatRate)}{" "}
        and becomes free for orders over {formatPKR(storeConfig.freeShippingThreshold)}.
      </p>
      <p>
        Estimated delivery is {storeConfig.deliveryEstimate}. Remote areas and public holidays may
        require additional time.
      </p>
    </Policy>
  );
}
export function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-6 pb-24 pt-32 md:pt-40">
      <p className="eyebrow mb-5">LEVA / Information</p>
      <h1 className="text-5xl font-light md:text-7xl">{title}</h1>
      <div className="mt-10 space-y-6 text-base leading-8 text-muted-foreground">
        {children}
        <p>This is placeholder policy content and will be updated before launch.</p>
      </div>
    </main>
  );
}
