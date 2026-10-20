import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProduct, products, slugAliases } from "@/data/products";

export function generateStaticParams() {
  const currentSlugs = products.map((p) => ({ slug: p.slug }));
  const legacySlugs = Object.keys(slugAliases).map((slug) => ({ slug }));
  return [...currentSlugs, ...legacySlugs];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = slugAliases[slug] || slug;
  const p = getProduct(canonicalSlug);
  const title = `${p?.name ?? "Product"} — LEVA Pakistan`;
  const description = p?.description ?? "LEVA skincare essential.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://leva.pk/shop/${canonicalSlug}`,
    },
    openGraph: {
      title: `${p?.name ?? "Product"} — LEVA`,
      description,
      url: `https://leva.pk/shop/${canonicalSlug}`,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

import { Suspense } from "react";
import View from "./view";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slugAliases[slug]) {
    redirect(`/shop/${slugAliases[slug]}`);
  }
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
