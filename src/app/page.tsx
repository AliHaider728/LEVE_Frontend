import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LEVA — Skincare for Her",
  description: "LEVA is a considered skincare ritual for her. Discover three essentials made for skin and self.",
  openGraph: { title: "LEVA — Skincare for Her", description: "Three essentials. One considered skincare ritual.", type: "website" },
  twitter: { card: "summary_large_image" },
};
import View from "./view";

export default function Page() {
  return <View />;
}
