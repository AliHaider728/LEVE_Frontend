"use client";
import { createFileRoute } from "@/lib/router-compat";
import { Policy } from "@/routes/shipping-policy";
export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchange — LEVA Pakistan" },
      { name: "description", content: "LEVA Pakistan returns and exchange information." },
      { property: "og:title", content: "Returns & Exchange — LEVA" },
      { property: "og:description", content: "Learn about LEVA's seven-day return process." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <Policy title="Returns & Exchange">
      <p>
        Eligible unopened products may be requested for return or exchange within seven days of
        delivery.
      </p>
      <p>
        Please contact us with your order number and clear photographs if an item arrives damaged or
        incorrect.
      </p>
    </Policy>
  );
}
