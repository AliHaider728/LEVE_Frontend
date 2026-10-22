import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Your Order — LEVA Pakistan",
  description: "Track your LEVA order using WhatsApp number, email, or order ID.",
  openGraph: { title: "Track Your LEVA Order", description: "Enter your WhatsApp number, email, or order number to see live tracking details.", type: "website" },
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
