"use client";
import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { createFileRoute, Link } from "@/lib/router-compat";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, BadgeCheck, Layers3, ShoppingBag, Truck } from "lucide-react";
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

const fly = [
  { x: -80, y: 40, rotate: -8 },
  { x: 0, y: 90, rotate: 0 },
  { x: 80, y: 40, rotate: 8 },
];
const fmt = (v: number) => formatPKR(Math.round(v));

function BundleTile({ bundle }: { bundle: Bundle }) {
  const { products } = useStoreData();
  const addBundle = useCart((s) => s.addBundle);
  const reduced = useReducedMotion();
  const included = bundle.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p);
  const original = getBundleOriginalPrice(bundle, products);
  return (
    <article className="flex w-[84vw] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white md:w-[440px]">
      <div className="relative aspect-[5/4] overflow-hidden bg-secondary">
        {bundle.image ? (
          <img
            src={bundle.image}
            alt={bundle.name + " with its included LEVA products"}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          included.map((p, i) => (
            <motion.img
              key={p.slug}
              src={p.image}
              alt={p.name}
              loading="lazy"
              initial={reduced ? false : { ...fly[i % 3], opacity: 0 }}
              whileInView={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 h-[80%] w-[46%] rounded-t-xl object-cover shadow-md"
              style={{
                left: `${(included.length === 3 ? 4 : 6) + i * (included.length === 3 ? 25 : 42)}%`,
                zIndex: i === 1 ? 2 : 1,
              }}
            />
          ))
        )}
        <motion.div
          initial={reduced ? false : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", delay: 0.5, stiffness: 320, damping: 12 }}
          className="absolute left-3 top-3 z-10 flex gap-2"
        >
          <Badge variant="saving">Save {bundle.savePercent}%</Badge>
          {included.length === 3 && <Badge>Best Value</Badge>}
        </motion.div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-2xl font-light text-foreground"><Link to={`/bundles/${bundle.slug}`} className="hover:underline">{bundle.name}</Link></h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.description}</p>
        <ul className="mt-2 text-sm text-muted-foreground">
          {included.map((p) => (
            <li key={p.slug}>· {p.name}</li>
          ))}
        </ul>
        <p className="mt-4 flex items-baseline gap-3">
          <strong className="text-xl font-medium">
            <CountUp value={bundle.price} format={fmt} />
          </strong>
          <span className="text-sm text-muted-foreground line-through">{formatPKR(original)}</span>
        </p>
        <p className="text-sm text-primary">You save {formatPKR(original - bundle.price)}</p>
        <Link to={`/bundles/${bundle.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline underline-offset-4">View bundle details <ArrowRight className="size-4" /></Link>
        <Button className="mt-2 h-12" disabled={!bundle.id} onClick={() => addBundle(bundle.slug)}>
          <ShoppingBag /> Add bundle to cart
        </Button>
      </div>
    </article>
  );
}

function BuildTile() {
  return (
    <article className="flex w-[84vw] shrink-0 snap-center flex-col justify-between rounded-3xl bg-primary p-8 text-primary-foreground md:w-[440px]">
      <div>
        <p className="eyebrow text-primary-foreground/80">Your mix</p>
        <h2 className="mt-3 text-3xl font-light">Build your own bundle</h2>
        <p className="mt-3 text-[15px] leading-7 text-primary-foreground/90">
          Pick any 2 items for 10% off, or 3+ for 20% off.
        </p>
      </div>
      <Button asChild className="mt-8 h-12 bg-white text-primary hover:bg-accent">
        <Link to="/bundles/build">
          Start building <ArrowRight />
        </Link>
      </Button>
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
    <main className="pb-24 pt-24 md:pt-[var(--header-h)]">
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[220vh]"}`}>
        <div
          className={`${reduced ? "py-16" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-8 overflow-hidden`}
        >
          {intro}
          <motion.div style={reduced ? {} : { x }} className="flex gap-8 pl-[8vw] pr-[8vw]">
            {tiles}
          </motion.div>
          {!reduced && (
            <div className="mx-[8vw] h-0.5 bg-primary/10">
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
