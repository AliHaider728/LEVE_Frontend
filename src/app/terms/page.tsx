import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — LEVA Pakistan",
  description: "Terms for shopping with LEVA Pakistan.",
  openGraph: { title: "Terms — LEVA", description: "Terms for shopping with LEVA Pakistan.", type: "website" },
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
