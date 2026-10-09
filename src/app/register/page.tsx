import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — LEVA",
  description: "Create a LEVA account to track orders and save your wishlist.",
  openGraph: { title: "Create Account — LEVA", description: "Join LEVA for faster checkout and order tracking.", type: "website" },
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
