import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact LEVA Pakistan",
  description: "Contact LEVA Pakistan about skincare, delivery, or your order.",
  openGraph: { title: "Contact LEVA Pakistan", description: "Send LEVA a note about skincare or your order.", type: "website" },
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
