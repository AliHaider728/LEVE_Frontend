import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order ${params.orderNumber} — LEVA",
  description: "Your LEVA Pakistan order confirmation.",
  openGraph: { title: "LEVA Order Confirmed", description: "Your LEVA order has been received.", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: { index: false },
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
