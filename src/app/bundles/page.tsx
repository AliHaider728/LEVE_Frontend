import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skincare Bundles — LEVA Pakistan",
  description: "Save on LEVA skincare bundles with nationwide delivery in Pakistan.",
  openGraph: { title: "LEVA Skincare Bundles", description: "Complete your LEVA ritual and save.", type: "website" },
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
