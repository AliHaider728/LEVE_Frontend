"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { bundles as savedBundles, getBundleOriginalPrice } from "@/data/bundles";
import { useStoreData } from "@/store/catalog";
import { useCart } from "@/store/cart";
import { formatPKR } from "@/config/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function View() {
  const params = useParams<{ slug: string }>();
  const { bundles, products } = useStoreData();
  const addBundle = useCart(state => state.addBundle);
  const slug = decodeURIComponent(params.slug ?? "");
  const bundle = bundles.find(item => item.slug === slug) ?? savedBundles.find(item => item.slug === slug);
  if (!bundle) return <main className="min-h-[60svh] px-5 pb-24 pt-28 md:px-[8vw] md:pt-[calc(var(--header-h)+3rem)]"><p className="eyebrow">LEVA / Bundles</p><h1 className="mt-4 text-4xl font-light">Bundle not found.</h1><Link href="/bundles" className="mt-8 inline-flex items-center gap-2 text-primary underline underline-offset-4"><ArrowLeft className="size-4"/>Back to bundles</Link></main>;
  const routineOrder = ["leva-face-wash", "leva-cream", "leva-tinted-sunblock", "product-03", "product-01", "product-02"];
  const included = bundle.productSlugs.map(productSlug => products.find(product => product.slug === productSlug)).filter((product): product is (typeof products)[number] => Boolean(product)).sort((a, b) => routineOrder.indexOf(a.slug) - routineOrder.indexOf(b.slug));
  const routineDirections: Record<string, string> = {
    "leva-face-wash": "Apply to a damp face, massage gently, then rinse thoroughly.",
    "leva-cream": "Apply a small amount to clean skin, following the product label.",
    "leva-tinted-sunblock": "Apply before sun exposure and reapply as directed on the product label.",
    "product-03": "Apply to a damp face, massage gently, then rinse thoroughly.",
    "product-01": "Apply a small amount to clean skin, following the product label.",
    "product-02": "Apply before sun exposure and reapply as directed on the product label.",
  };
  const original = getBundleOriginalPrice(bundle, products);
  return <main className="pb-24 pt-24 md:pt-[calc(var(--header-h)+2rem)]">
    <div className="mx-auto max-w-7xl px-5 md:px-[5vw]">
      <Link href="/bundles" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="size-4"/>All bundles</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.06fr_.94fr] lg:gap-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFF4F6] to-[#FCEEF1] aspect-square flex items-end justify-center">
          {bundle.image && bundle.slug !== 'the-essentials' && !bundle.name.toLowerCase().includes('duo') ? (
            <img src={bundle.image} alt={`${bundle.name} with LEVA products`} className="aspect-square w-full object-contain p-4"/>
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              {included.map((product, i) => (
                <img
                  key={product.slug}
                  src={product.image}
                  alt={product.name}
                  className="absolute bottom-0 rounded-t-2xl object-cover shadow-[0_16px_36px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:scale-105"
                  style={{
                    left: included.length === 2 ? (i === 0 ? "12%" : "46%") : `${(included.length === 3 ? 4 : 6) + i * (included.length === 3 ? 25 : 42)}%`,
                    width: included.length === 2 ? "44%" : "44%",
                    height: included.length === 2 ? (i === 0 ? "84%" : "88%") : "80%",
                    zIndex: i === 1 ? 2 : 1,
                    transform: included.length === 2 ? (i === 0 ? "rotate(-2deg)" : "rotate(2deg)") : "none"
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow">LEVA / Curated ritual</p>
          <h1 className="mt-4 text-4xl font-light leading-tight text-primary md:text-5xl">{bundle.name}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{bundle.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3"><Badge variant="saving">Save {bundle.savePercent}%</Badge><span className="text-sm text-muted-foreground">{included.length} LEVA essentials</span></div>
          <div className="mt-7 flex flex-wrap items-baseline gap-3"><strong className="text-3xl font-medium">{formatPKR(bundle.price)}</strong><span className="text-lg text-muted-foreground line-through">{formatPKR(original)}</span><span className="text-sm text-primary">Save {formatPKR(Math.max(0,original-bundle.price))}</span></div>
          <Button className="mt-7 h-12 w-full sm:w-auto" onClick={() => addBundle(bundle.slug)}><ShoppingBag className="size-4"/>Add bundle to cart</Button>
          {!bundle.id && <p className="mt-3 text-sm text-muted-foreground">This preview can be added to your cart. Live checkout needs the bundle saved to the store; use WhatsApp to request it while the store connection is unavailable.</p>}
          <p className="mt-6 text-sm text-muted-foreground">Cash on Delivery · Nationwide shipping · Free delivery over Rs. 3,000</p>
        </div>
      </div>
      <section className="mt-20 border-t border-primary/15 pt-10"><div className="flex items-center gap-3"><Sparkles className="size-5 text-primary"/><p className="eyebrow">Your routine</p></div><h2 className="mt-3 text-3xl font-light md:text-4xl">What is inside.</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{included.map((product,index) => <article key={product.slug} className="flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white"><Link href={`/shop/${product.slug}`} className="block aspect-square overflow-hidden bg-[#FFF4F6]"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"/></Link><div className="flex flex-1 flex-col p-5"><p className="eyebrow">Step {index+1}</p><h3 className="mt-2 text-xl font-medium">{product.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{product.benefit}</p><p className="mt-4 text-sm leading-6">{routineDirections[product.slug] ?? product.usage}</p><Link href={`/shop/${product.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">View product <ArrowRight className="size-4"/></Link></div></article>)}</div></section>
    </div>
  </main>;
}
