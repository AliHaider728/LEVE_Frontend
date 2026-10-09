import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — LEVA Pakistan",
  description: "How LEVA handles customer information.",
  openGraph: { title: "Privacy Policy — LEVA", description: "How LEVA handles customer information.", type: "website" },
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
