import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — LEVA",
  description: "Get a link to reset your LEVA account password.",
  openGraph: { title: "Reset Password — LEVA", description: "Reset your LEVA account password.", type: "website" },
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
