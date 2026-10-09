import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy — LEVA Pakistan",
  description: "LEVA Pakistan shipping rates and delivery estimates.",
  openGraph: { title: "Shipping Policy — LEVA", description: "Delivery information for LEVA Pakistan orders.", type: "website" },
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
