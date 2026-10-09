import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About LEVA — Care at Her Pace",
  description: "Discover the story, philosophy, and values behind LEVA Pakistan.",
  openGraph: { title: "About LEVA — Care at Her Pace", description: "The philosophy behind LEVA's three skincare rituals.", type: "website" },
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
