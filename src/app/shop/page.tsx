import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop LEVA — The Ritual Index",
  description: "Shop LEVA's three skincare essentials and bundles in Pakistan, with Cash on Delivery nationwide.",
  openGraph: { title: "Shop LEVA — The Ritual Index", description: "Cleanser, sunscreen and cream. Delivered across Pakistan.", type: "website" },
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
