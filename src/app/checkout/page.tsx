import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — LEVA Pakistan",
  description: "Fast guest checkout for LEVA skincare with Cash on Delivery across Pakistan.",
  openGraph: { title: "Checkout — LEVA Pakistan", description: "Order LEVA in under a minute. No account needed.", type: "website" },
  twitter: { card: "summary_large_image" },
};
import { Suspense } from "react";
import View from "./view";

export default function Page() {
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
