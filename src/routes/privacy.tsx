"use client";
import { createFileRoute } from "@/lib/router-compat";
import { Policy } from "@/routes/shipping-policy";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LEVA Pakistan" },
      { name: "description", content: "How LEVA handles customer information." },
      { property: "og:title", content: "Privacy Policy — LEVA" },
      { property: "og:description", content: "How LEVA handles customer information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <Policy title="Privacy Policy">
      <p>
        We use the information you provide to fulfil orders, answer enquiries, and improve your
        shopping experience.
      </p>
      <p>
        We do not sell personal information. Checkout details are stored locally in this initial
        storefront demonstration.
      </p>
    </Policy>
  );
}
