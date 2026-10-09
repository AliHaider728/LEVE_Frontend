import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — LEVA",
  description: "Sign in to your LEVA account to see orders and wishlist.",
  openGraph: { title: "Login — LEVA", description: "Sign in to your LEVA skincare account.", type: "website" },
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
