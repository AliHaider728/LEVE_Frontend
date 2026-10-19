import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { getBundleOriginalPrice, type Bundle } from "@/data/bundles";

import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function SceneCard({ bundle }: { bundle: Bundle }) {
  const { products } = useStoreData();
  const addBundle = useCart((s) => s.addBundle);
  const included = bundle.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p);
  const original = getBundleOriginalPrice(bundle, products);
  const isDuo = bundle.slug === "the-essentials" || bundle.name.toLowerCase().includes("duo") || included.length === 2;
  const showStaticImage = Boolean(bundle.image && !isDuo);

  return (
    <article className="grid w-[80vw] max-w-[420px] shrink-0 snap-center gap-5 rounded-3xl bg-background p-5 md:w-[min(780px,65vw)] md:max-w-none md:grid-cols-[1.1fr_1fr] md:p-6">
      <Link
        to="/bundles/$slug"
        params={{ slug: bundle.slug }}
        className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#FFF4F6] cursor-pointer"
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
                className={`h-[82%] w-[44%] rounded-t-xl object-contain drop-shadow-md transition-transform duration-500 hover:scale-105 ${
                  i === 0 ? "-mr-3 z-10 -rotate-2" : "z-20 rotate-2"
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Badge variant="saving">Save {formatPKR(original - bundle.price)}</Badge>
          {bundle.productSlugs.length === 3 && <Badge>Best Value</Badge>}
        </div>
      </Link>
      <div className="flex flex-col justify-center">
        <p className="eyebrow">{included.length} Products</p>
        <h3 className="mt-1 text-2xl font-light md:text-3xl">
          <Link to="/bundles/$slug" params={{ slug: bundle.slug }} className="hover:underline">
            {bundle.name}
          </Link>
        </h3>
        <p className="mt-3 flex items-baseline gap-3">
          <strong className="text-xl font-medium sm:text-2xl">{formatPKR(bundle.price)}</strong>
          <span className="text-sm text-muted-foreground line-through">{formatPKR(original)}</span>
        </p>
        <p className="mt-1 text-xs font-medium text-accent sm:text-sm">
          You save {formatPKR(original - bundle.price)} ({bundle.savePercent}%)
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Button className="h-11 sm:h-12" onClick={() => addBundle(bundle.slug)}>
            <ShoppingBag className="mr-1.5 size-4" /> Add bundle
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Link
              to="/bundles/$slug"
              params={{ slug: bundle.slug }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              View bundle details <ArrowRight className="size-3.5" />
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 border-primary/20 bg-transparent text-xs font-medium text-primary hover:bg-primary hover:text-white"
            >
              <Link to="/bundles/build">
                <Sparkles className="mr-1 size-3 text-accent" /> Make your own
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BundleScene() {
  const { bundles } = useStoreData();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const head = (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-5 md:px-[6vw]">
      <div>
        <p className="eyebrow text-primary-foreground/80">Bundles</p>
        <h2 className="mt-2 text-3xl font-light text-primary-foreground md:text-[2.75rem]">
          Save more with a ritual.
        </h2>
      </div>
      <Button asChild variant="outline" className="h-11 border-white/20 bg-white/10 text-xs font-medium text-white hover:bg-white hover:text-primary sm:text-sm">
        <Link to="/bundles/build">
          <Sparkles className="mr-1.5 size-3.5 text-accent" /> Make your own bundle
        </Link>
      </Button>
    </div>
  );
  return (
    <section aria-label="Bundles" className="bg-primary">
      {/* Desktop: sticky horizontal scene */}
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[220vh]"}`}>
        <div
          className={`${reduced ? "" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-8 overflow-hidden py-12`}
        >
          {head}
          <motion.div
            style={reduced ? {} : { x }}
            className={`flex gap-8 pl-[6vw] ${reduced ? "flex-wrap" : ""}`}
          >
            {bundles.map((b) => (
              <SceneCard key={b.slug} bundle={b} />
            ))}
          </motion.div>
        </div>
      </div>
      {/* Mobile: swipe */}
      <div className="py-14 lg:hidden">
        {head}
        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {bundles.map((b) => (
            <SceneCard key={b.slug} bundle={b} />
          ))}
        </div>
        <div className="mt-8 flex justify-center px-5">
          <Button asChild size="lg" className="h-12 w-full max-w-sm bg-white text-sm font-medium text-primary hover:bg-white/90">
            <Link to="/bundles/build">
              <Sparkles className="mr-2 size-4 text-primary" /> Make your own bundle →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
