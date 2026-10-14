import type { Metadata } from "next";
import { bundles } from "@/data/bundles";
import View from "./view";

export function generateStaticParams() {
  return bundles.map(bundle => ({ slug: bundle.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bundle = bundles.find(item => item.slug === slug);
  const title = `${bundle?.name ?? "Bundle"} — LEVA Pakistan`;
  const description = bundle?.description ?? "Explore LEVA skincare bundles.";
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default function Page() { return <View />; }
