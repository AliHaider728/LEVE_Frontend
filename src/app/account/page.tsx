import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account — LEVA",
  description: "Your LEVA orders, addresses, wishlist and profile.",
  openGraph: { title: "My Account — LEVA", description: "Manage your LEVA orders and details.", type: "website" },
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
