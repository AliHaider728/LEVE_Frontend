import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart — LEVA Pakistan",
  description: "Review your LEVA skincare order in PKR.",
  openGraph: { title: "Your Cart — LEVA", description: "Review your LEVA skincare order.", type: "website" },
  twitter: { card: "summary_large_image" },
};
import { Suspense } from "react";
import View from "./view";
import { CartSkeleton } from "@/routes/cart";

export default function Page() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <View />
    </Suspense>
  );
}
