import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart — LEVA Pakistan",
  description: "Review your LEVA skincare order in PKR.",
  openGraph: { title: "Your Cart — LEVA", description: "Review your LEVA skincare order.", type: "website" },
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
