import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order — LEVA Pakistan",
  description: "Check the status of your LEVA order with your order number and mobile number.",
  openGraph: { title: "Track Your LEVA Order", description: "Enter your order number and phone to see your order status.", type: "website" },
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
