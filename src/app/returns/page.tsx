import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange — LEVA Pakistan",
  description: "LEVA Pakistan returns and exchange information.",
  openGraph: { title: "Returns & Exchange — LEVA", description: "Learn about LEVA's seven-day return process.", type: "website" },
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
