"use client";
import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { createFileRoute, Link } from "@/lib/router-compat";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, BadgeCheck, Check, Layers3, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { getBundleOriginalPrice, bundles as localBundles, type Bundle } from "@/data/bundles";

import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { CountUp } from "@/components/shop/CountUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/bundles/")({
  head: () => ({
    meta: [
      { title: "Skincare Bundles — LEVA Pakistan" },
      {
        name: "description",
        content: "Save on LEVA skincare bundles with nationwide delivery in Pakistan.",
      },
      { property: "og:title", content: "LEVA Skincare Bundles" },
      { property: "og:description", content: "Complete your LEVA ritual and save." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BundlesPage,
});

const fmt = (v: number) => formatPKR(Math.round(v));

function BundleTile({ bundle }: { bundle: Bundle }) {
  const { products } = useStoreData();
  const addBundle = useCart((s) => s.addBundle);
  const included = bundle.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p);
  const original = getBundleOriginalPrice(bundle, products);
  const isDuo = bundle.slug === "the-essentials" || bundle.name.toLowerCase().includes("duo") || included.length === 2;
  const showStaticImage = Boolean(bundle.image && !isDuo);

  return (
    <article className="flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm sm:w-[360px] md:w-[440px] md:max-w-none">
      <Link
        to="/bundles/$slug"
        params={{ slug: bundle.slug }}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#FFF4F6] cursor-pointer sm:aspect-[5/4]"
        aria-label={`View ${bundle.name} details`}
      >
        {showStaticImage ? (
          <img
            src={bundle.image}
            alt={`${bundle.name} with its included LEVA products`}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-end justify-center pb-2">
            {included.map((p, i) => (
              <img
                key={p.slug}
                src={p.image}
                alt={p.name}
                loading="lazy"
                className={`h-[82%] w-[46%] rounded-t-xl object-contain drop-shadow-md transition-transform duration-500 hover:scale-105 ${
                  i === 0 ? "-mr-3 z-10 -rotate-2" : "z-20 rotate-2"
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Badge variant="saving">Save {bundle.savePercent}%</Badge>
          {included.length === 3 && <Badge>Best Value</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 md:p-7">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>{included.length} Products</span>
          <span className="font-medium text-accent">Save {formatPKR(original - bundle.price)}</span>
        </div>

        <h2 className="mt-1 text-xl font-light text-foreground sm:text-2xl md:mt-2 md:text-3xl">
          <Link to="/bundles/$slug" params={{ slug: bundle.slug }} className="hover:underline">
            {bundle.name}
          </Link>
        </h2>

        {/* Description & included list on desktop */}
        <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
          {bundle.description}
        </p>
        <ul className="mt-2 hidden text-sm text-muted-foreground md:block">
          {included.map((p) => (
            <li key={p.slug}>· {p.name}</li>
          ))}
        </ul>

        <p className="mt-3 flex items-baseline gap-2.5 md:mt-4 md:gap-3">
          <strong className="text-xl font-medium md:text-2xl">
            <CountUp value={bundle.price} format={fmt} />
          </strong>
          <span className="text-sm text-muted-foreground line-through">{formatPKR(original)}</span>
        </p>
        <p className="hidden text-sm text-primary md:block">
          You save {formatPKR(original - bundle.price)}
        </p>

        <div className="mt-auto pt-4 md:pt-5">
          <Button
            className="h-11 w-full sm:h-12"
            disabled={!bundle.id}
            onClick={() => addBundle(bundle.slug)}
          >
            <ShoppingBag className="mr-1.5 size-4" /> Add bundle to cart
          </Button>
          <div className="mt-2 text-center">
            <Link
              to="/bundles/$slug"
              params={{ slug: bundle.slug }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline md:text-sm"
            >
              View bundle details <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function BuildTile() {
  return (
    <article className="flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col justify-between rounded-3xl border border-primary/20 bg-primary p-6 text-primary-foreground shadow-sm sm:w-[360px] md:w-[440px] md:max-w-none md:p-8">
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            <Sparkles className="size-3 text-accent" /> Custom Routine
          </span>
          <span className="text-xs font-medium text-white/80">Up to 15% off</span>
        </div>
        <p className="eyebrow mt-4 hidden text-primary-foreground/80 md:block">Your mix</p>
        <h2 className="mt-2 text-2xl font-light md:mt-1 md:text-3xl">Build your own bundle</h2>
        <p className="mt-2 text-xs text-white/80 sm:text-sm md:text-[15px] md:leading-7 md:text-primary-foreground/90">
          Pick any 2 items for 10% off, or 3+ for 15% off. Curate your personalised LEVA ritual.
        </p>

        <div className="mt-4 space-y-2.5 md:mt-6 md:space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/10 p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                <Check className="size-3" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white sm:text-sm">Choose any 2 products</p>
                <p className="text-[10px] text-white/70">Everyday duo ritual</p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-white/20 px-2 py-1 text-xs font-bold text-accent">
              Save 10%
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-white/15 p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-primary">
                ★
              </span>
              <div>
                <p className="text-xs font-semibold text-white sm:text-sm">Choose any 3 products</p>
                <p className="text-[10px] text-accent">Complete 3-step ritual</p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-bold text-primary">
              Save 15%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-2 md:mt-8">
        <Button asChild className="h-11 w-full bg-white text-primary hover:bg-accent sm:h-12">
          <Link to="/bundles/build">
            Start building <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function BundlesPage() {
  const { bundles, ready, notice } = useStoreData();
  const displayBundles = bundles && bundles.length > 0 ? bundles : (notice || !ready ? localBundles : []);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const benefits = [
    [BadgeCheck, "Save more"],
    [Layers3, "Complete routine"],
    [Truck, "Free delivery over Rs. 3,000"],
  ] as const;

  const tiles = (
    <>
      {displayBundles.map((b) => (
        <BundleTile key={b.slug} bundle={b} />
      ))}
      <BuildTile />
    </>
  );

  const intro = (
    <div className="px-5 md:px-[8vw]">
      <p className="eyebrow">LEVA / Bundles</p>
      <h1 className="mt-2 text-4xl font-light text-foreground md:text-[2.75rem]">
        Better together.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
        Ready-made rituals or your own mix. Every bundle uses only our three products.
      </p>
    </div>
  );

  return (
    <main className="pb-24 pt-[calc(var(--header-h)+1.5rem)] md:pt-[calc(var(--header-h)+1.5rem)]">
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[220vh]"}`}>
        <div
          className={`${reduced ? "py-16" : "sticky top-[var(--header-h)] min-h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-6 overflow-hidden py-6`}
        >
          {intro}
          <motion.div style={reduced ? {} : { x }} className="flex gap-8 pl-[8vw] pr-[8vw]">
            {tiles}
          </motion.div>
          {!reduced && (
            <div className="mx-[8vw] mt-2 h-0.5 bg-primary/10">
              <motion.div
                className="h-full origin-left bg-accent"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="lg:hidden">
        {intro}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
          {tiles}
        </div>
      </div>
      <section className="mx-5 mt-16 grid gap-px border border-primary/15 bg-primary/15 md:mx-[8vw] md:grid-cols-3">
        {benefits.map(([Icon, copy]) => (
          <div
            key={copy}
            className="flex min-h-24 items-center gap-4 bg-white p-6 text-base font-medium"
          >
            <Icon className="text-primary" />
            {copy}
          </div>
        ))}
      </section>
    </main>
  );
}
