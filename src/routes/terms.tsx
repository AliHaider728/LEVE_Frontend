"use client";
import { createFileRoute } from "@/lib/router-compat";
import { Policy } from "@/routes/shipping-policy";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — LEVA Pakistan" },
      { name: "description", content: "Terms for shopping with LEVA Pakistan." },
      { property: "og:title", content: "Terms — LEVA" },
      { property: "og:description", content: "Terms for shopping with LEVA Pakistan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <Policy title="Terms">
      <p>
        By placing an order, you confirm that the information supplied is accurate and that you are
        authorised to use the selected payment method.
      </p>
      <p>
        Product names, formulas, payment details, and contact information shown as placeholders must
        be replaced before launch.
      </p>
    </Policy>
  );
}
