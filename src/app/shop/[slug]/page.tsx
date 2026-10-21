import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { slugAliases } from "@/data/products";
import { getServerProduct } from "@/lib/server/catalog";
import View from "./view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = slugAliases[slug] || slug;
  const p = await getServerProduct(canonicalSlug);
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonicalSlug = slugAliases[slug] || slug;
  if (slugAliases[slug]) {
    redirect(`/shop/${canonicalSlug}`);
  }
  const product = await getServerProduct(canonicalSlug);
  if (!product) notFound();
  return <View initialProduct={product} />;
}
