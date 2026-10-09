import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Own Ritual — LEVA",
  description: "Pick your LEVA products and save up to 20% with a custom skincare bundle.",
  openGraph: { title: "Build Your Own LEVA Ritual", description: "2 products = 10% off, 3 products = 20% off.", type: "website" },
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
