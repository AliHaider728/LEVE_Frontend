import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { getBundleOriginalPrice, bundles as localBundles, type Bundle } from "@/data/bundles";

import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Card({
  bundle,
  index,
  progress,
  total,
}: {
  bundle: Bundle;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const { products } = useStoreData();
  const addBundle = useCart((s) => s.addBundle);
  const reduced = useReducedMotion();
  const start = index / total;
  const scale = useTransform(
    progress,
    [start, 1],
    reduced ? [1, 1] : [1, 1 - (total - index - 1) * 0.06],
  );
  const dim = useTransform(
    progress,
    [start + 0.3, 1],
    reduced ? [1, 1] : [1, index === total - 1 ? 1 : 0.55],
  );
  const included = bundle.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p);
  const original = getBundleOriginalPrice(bundle, products);
  const isDuo = bundle.slug === "the-essentials" || bundle.name.toLowerCase().includes("duo") || included.length === 2;
  const showStaticImage = Boolean(bundle.image && !isDuo);

  return (
    <div
      className="mb-6 flex items-start justify-center md:sticky md:top-[calc(var(--header-h)+2rem)] md:mb-0 md:h-[52svh] md:last:h-auto md:last:pb-16"
      style={{ paddingTop: index * 20 }}
    >
      <motion.article
        style={{ scale, opacity: dim }}
        className="grid w-full max-w-5xl origin-top gap-6 overflow-hidden rounded-3xl bg-background p-5 shadow-[0_20px_50px_-25px_var(--color-primary)] md:grid-cols-[1.1fr_1fr] md:p-6"
      >
        <Link
          to="/bundles/$slug"
          params={{ slug: bundle.slug }}
          className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#FFF4F6] cursor-pointer sm:aspect-[16/11]"
          aria-label={`View ${bundle.name} details`}
        >
          {showStaticImage ? (
            <img
              src={bundle.image}
              alt={`${bundle.name} with its included LEVA products`}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-end justify-center pb-2">
              {included.map((p, i) => (
                <img
                  key={p.slug}
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className={`h-[82%] w-[44%] rounded-t-xl object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 ${
                    i === 0 ? "-mr-3 z-10 -rotate-2" : "z-20 rotate-2"
                  }`}
                />
              ))}
            </div>
          )}
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <Badge variant="saving">
              Save {formatPKR(original - bundle.price)} ({bundle.savePercent}%)
            </Badge>
            {included.length === 3 && <Badge>Best Value</Badge>}
          </div>
        </Link>
        <div className="flex flex-col justify-center">
          <p className="eyebrow">{included.length} Products</p>
          <h3 className="mt-1 text-2xl font-light text-foreground md:text-3xl">
            <Link to="/bundles/$slug" params={{ slug: bundle.slug }} className="hover:underline">
              {bundle.name}
            </Link>
          </h3>
          <p className="mt-3 flex items-baseline gap-3">
            <strong className="text-2xl font-medium">{formatPKR(bundle.price)}</strong>
            <span className="text-sm text-muted-foreground line-through">
              {formatPKR(original)}
            </span>
          </p>
          <p className="mt-1 text-sm font-medium text-accent">
            You save {formatPKR(original - bundle.price)}
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button className="h-11 md:h-12" onClick={() => addBundle(bundle.slug)}>
              <ShoppingBag className="mr-1.5 size-4" /> Add bundle to cart
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Link
                to="/bundles/$slug"
                params={{ slug: bundle.slug }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                View bundle details <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function BundleStack() {
  const { bundles, ready, notice } = useStoreData();
  const displayBundles = bundles && bundles.length > 0 ? bundles : (notice || !ready ? localBundles : []);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  if (displayBundles.length === 0) return null;
  return (
    <section aria-label="Bundles" className="bg-secondary px-5 pt-16 md:px-[8vw] md:pt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow">Bundles</p>
          <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">
            Better together.
          </h2>
        </div>
        <Button asChild variant="outline" className="h-11 border-primary/25 bg-white text-xs font-medium text-primary hover:bg-primary hover:text-white sm:text-sm">
          <Link to="/bundles/build">
            <Sparkles className="mr-1.5 size-3.5 text-accent" /> Make your own bundle
          </Link>
        </Button>
      </div>
      <div ref={ref} className="mt-8 pb-8">
        {displayBundles.map((b, i) => (
          <Card
            key={b.slug}
            bundle={b}
            index={i}
            total={displayBundles.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-2 pb-12 text-center">
        <Button asChild size="lg" className="h-12 bg-primary px-8 text-sm font-medium text-white shadow-md hover:bg-primary/90">
          <Link to="/bundles/build">
            <Sparkles className="mr-2 size-4 text-accent" /> Make your own bundle →
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Choose any 2 for 10% off, or all 3 for 20% off.
        </p>
      </div>
    </section>
  );
}
