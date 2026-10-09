import type { Metadata } from "next";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  const title = `${p?.name ?? "Product"} — LEVA Pakistan`;
  const description = p?.description ?? "LEVA skincare essential.";
  return { title, description, openGraph: { title: `${p?.name ?? "Product"} — LEVA`, description, type: "website" }, twitter: { card: "summary_large_image" } };
}
import { Suspense } from "react";
import View from "./view";

export default function Page() {
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
