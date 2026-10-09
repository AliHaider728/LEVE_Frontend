"use client";
import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@/lib/router-compat";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { BadgeCheck, Banknote, LayoutGrid, Rows3, SlidersHorizontal, Truck, X } from "lucide-react";
import { concerns, productTypes, products, type Product } from "@/data/products";
import hero from "@/assets/leva-ritual-hero.png.asset.json";
import { ProductCard } from "@/components/product/ProductCard";
import { StoryRow } from "@/components/shop/StoryRow";
import { BundleScene } from "@/components/shop/BundleScene";
import { SkinQuiz } from "@/components/shop/SkinQuiz";
import { MiniCart } from "@/components/shop/MiniCart";
import { QuickView } from "@/components/shop/QuickView";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { ArrowRight, PackagePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Search = { type?: string; concern?: string; sort?: string; stock?: boolean; view?: "story" };
const sorts = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Best rated",
  newest: "Newest",
} as const;

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["type"] === "string" ? { type: s["type"] } : {}),
    ...(typeof s["concern"] === "string" ? { concern: s["concern"] } : {}),
    ...(typeof s["sort"] === "string" ? { sort: s["sort"] } : {}),
    ...(s["stock"] === true || s["stock"] === "true" ? { stock: true } : {}),
    ...(s["view"] === "story" ? { view: "story" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Shop LEVA — The Ritual Index" },
      {
        name: "description",
        content:
          "Shop LEVA's three skincare essentials and bundles in Pakistan, with Cash on Delivery nationwide.",
      },
      { property: "og:title", content: "Shop LEVA — The Ritual Index" },
      {
        property: "og:description",
        content: "Cleanser, serum and cream. Delivered across Pakistan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function applyFilters(list: Product[], s: Search) {
  let r = list.filter(
    (p) =>
      (!s.type || s.type === "Bundles" || p.type === s.type) &&
      (!s.concern || p.concerns.includes(s.concern as never)) &&
      (!s.stock || p.stock > 0),
  );
  if (s.type === "Bundles") r = [];
  const sorted = [...r];
  if (s.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (s.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (s.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  if (s.sort === "newest") sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  return sorted;
}

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/" });
  const set = (patch: { [K in keyof Search]?: Search[K] | undefined }) =>
    void navigate({
      search: (prev) => {
        const n: Record<string, unknown> = { ...prev, ...patch };
        Object.keys(n).forEach((k) => (n[k] === undefined || n[k] === false) && delete n[k]);
        return n as Search;
      },
      replace: true,
      resetScroll: false,
    });
  const results = applyFilters(products, search);
  const [quick, setQuick] = useState<Product | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const active = [
    search.type && { k: "type" as const, label: search.type },
    search.concern && { k: "concern" as const, label: search.concern },
    search.stock && { k: "stock" as const, label: "In stock" },
    search.sort &&
      search.sort !== "featured" && {
        k: "sort" as const,
        label: sorts[search.sort as keyof typeof sorts] ?? search.sort,
      },
  ].filter(Boolean) as { k: keyof Search; label: string }[];
  const reset = () => void navigate({ search: {}, replace: true, resetScroll: false });
  const showBundlesOnly = search.type === "Bundles";

  const controls = (mobile = false) => (
    <>
      <ChipGroup
        id={mobile ? "m-type" : "type"}
        label="Type"
        options={["All", ...productTypes, "Bundles"]}
        value={search.type ?? "All"}
        onChange={(v) => set({ type: v === "All" ? undefined : v })}
      />
      <span aria-hidden className="hidden h-6 w-px shrink-0 bg-primary/20 md:block" />
      <ChipGroup
        id={mobile ? "m-concern" : "concern"}
        label="Concern"
        options={concerns}
        value={search.concern ?? ""}
        onChange={(v) => set({ concern: search.concern === v ? undefined : v })}
      />
      <span aria-hidden className="hidden h-6 w-px shrink-0 bg-primary/20 md:block" />
      <label className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-wider">
        Sort
        <select
          value={search.sort ?? "featured"}
          onChange={(e) =>
            set({ sort: e.target.value === "featured" ? undefined : e.target.value })
          }
          className="min-h-11 rounded-full border border-primary/30 bg-background px-3 text-sm normal-case tracking-normal"
        >
          {Object.entries(sorts).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!search.stock}
          onChange={(e) => set({ stock: e.target.checked || undefined })}
          className="size-4 accent-[var(--color-primary)]"
        />{" "}
        In stock
      </label>
    </>
  );

  return (
    <main className="pb-16 md:pb-0">
      <Intro />

      <div className="sticky top-16 z-30 border-y border-primary/15 bg-white md:top-[var(--header-h)]">
        <div className="hidden items-center gap-4 overflow-x-auto px-[6vw] py-2 md:flex [scrollbar-width:none]">
          {controls()}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 md:hidden [scrollbar-width:none]">
          <Button
            variant="outline"
            magnetic={false}
            className="min-h-11 shrink-0 rounded-full"
            onClick={() => setSheet(true)}
          >
            <SlidersHorizontal /> Filter & sort
          </Button>
          <ChipGroup
            id="mobile-strip"
            label="Type"
            options={["All", ...productTypes, "Bundles"]}
            value={search.type ?? "All"}
            onChange={(v) => set({ type: v === "All" ? undefined : v })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2 md:px-[6vw]">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {showBundlesOnly
              ? "2 bundles"
              : `${results.length} product${results.length === 1 ? "" : "s"}`}
          </p>
          {active.map((a) => (
            <button
              key={a.k}
              type="button"
              onClick={() => set({ [a.k]: undefined })}
              className="flex min-h-8 items-center gap-1 rounded-full bg-secondary px-3 text-xs"
              aria-label={`Remove filter ${a.label}`}
            >
              {a.label} <X className="size-3" />
            </button>
          ))}
          {active.length > 0 && (
            <button type="button" onClick={reset} className="min-h-8 text-xs underline">
              Clear all
            </button>
          )}
          <div
            className="ml-auto flex rounded-full border border-primary/20 p-0.5"
            role="group"
            aria-label="View"
          >
            <button
              type="button"
              aria-pressed={search.view === "story"}
              onClick={() => set({ view: "story" })}
              className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-xs ${search.view === "story" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Rows3 className="size-4" /> Story
            </button>
            <button
              type="button"
              aria-pressed={!search.view}
              onClick={() => set({ view: undefined })}
              className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-xs ${!search.view ? "bg-primary text-primary-foreground" : ""}`}
            >
              <LayoutGrid className="size-4" /> Grid
            </button>
          </div>
        </div>
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent
          side="bottom"
          className="max-h-[85svh] overflow-y-auto rounded-t-3xl bg-background pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl font-light">Filter & sort</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-5 [&>span]:hidden">{controls(true)}</div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setSheet(false)}>
              Show results
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {!showBundlesOnly &&
        (results.length === 0 ? (
          <div className="px-5 py-24 text-center">
            <h2 className="text-2xl font-light">No products match these filters.</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">Try removing a filter.</p>
            <Button className="mt-6" onClick={reset}>
              Reset filters
            </Button>
          </div>
        ) : !search.view ? (
          <ShopGrid results={results} />
        ) : (
          <StoryList results={results} highlight={highlight} onQuickView={setQuick} />
        ))}

      <BundleScene />
      <SkinQuiz
        onHighlight={(slug) => {
          setHighlight(slug);
          if (slug && search.view !== "story") set({ view: "story" });
        }}
      />
      <MiniCart />
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </main>
  );
}

function StoryList({
  results,
  highlight,
  onQuickView,
}: {
  results: Product[];
  highlight: string | null;
  onQuickView: (p: Product) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const tones = ["bg-background", "bg-secondary/50", "bg-secondary"];
  return (
    <div ref={ref} className="relative">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block"
        preserveAspectRatio="none"
        viewBox="0 0 2 100"
      >
        <motion.path
          d="M1 0 L1 100"
          stroke="var(--color-accent)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduced ? 1 : scrollYProgress }}
        />
      </svg>
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {results.map((p, i) => (
            <motion.section
              key={p.slug}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative px-5 py-16 md:px-[6vw] md:py-28 ${tones[i % 3]}`}
            >
              <div className="relative mx-auto max-w-6xl">
                <StoryRow
                  product={p}
                  index={i}
                  highlighted={highlight === p.slug}
                  onQuickView={() => onQuickView(p)}
                />
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

function ChipGroup({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex shrink-0 flex-wrap gap-1 md:flex-nowrap"
    >
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={`relative min-h-11 shrink-0 rounded-full px-4 text-sm transition-colors ${on ? "text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
          >
            {on && (
              <motion.span
                layoutId={`chip-${id}`}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
              />
            )}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function Intro() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "18%"]);
  return (
    <section
      ref={ref}
      className="grid min-h-[70svh] items-center gap-10 px-5 pb-12 pt-24 md:grid-cols-[1fr_0.8fr] md:px-[6vw] md:pt-36"
    >
      <div>
        <p className="eyebrow">The LEVA Index</p>
        <h1 className="mt-3 text-4xl font-light leading-tight text-foreground md:text-[2.75rem]">
          Shop LEVA
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
          Three essentials for one calm daily ritual. Pick one, or save with a bundle.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
          {[
            { i: Banknote, t: "Cash on Delivery" },
            { i: Truck, t: "Free delivery over Rs. 3,000" },
            { i: BadgeCheck, t: "7-day returns" },
          ].map(({ i: I, t }) => (
            <li
              key={t}
              className="flex min-h-9 items-center gap-2 rounded-full border border-primary/25 px-3"
            >
              <I className="size-4 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <motion.div
        initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[999px] rounded-b-3xl bg-secondary"
      >
        <motion.img
          style={{ y, scale: 1.2 }}
          src={hero.url}
          alt="LEVA cleanser, serum and cream together"
          className="h-full w-full object-cover"
        />
      </motion.div>
    </section>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** 4-column grid. With fewer than 4 products, the "Build your own bundle" tile fills the row; otherwise it moves to the end. */
function ShopGrid({ results }: { results: Product[] }) {
  const reduced = useReducedMotion();
  return (
    <LayoutGroup>
      <div className="grid grid-cols-2 gap-4 px-4 py-12 md:grid-cols-3 md:gap-6 md:px-[6vw] lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {results.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              custom={i}
              variants={reveal}
              initial={reduced ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={reduced ? {} : { y: -6 }}
              transition={{ layout: { type: "spring", damping: 26, stiffness: 260 } }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
          <motion.div
            key="build-your-own"
            layout
            custom={results.length}
            variants={reveal}
            initial={reduced ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={reduced ? {} : { y: -6 }}
          >
            <Link
              to="/bundles/build"
              className="flex h-full min-h-[22rem] flex-col justify-between rounded-2xl bg-primary p-6 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <PackagePlus className="size-8" />
              <div>
                <h2 className="text-2xl font-light">Build your own bundle</h2>
                <p className="mt-2 text-sm text-primary-foreground/90">
                  Pick 2 items for 10% off, 3+ for 20% off.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                  Start building <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
