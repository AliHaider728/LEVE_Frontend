import Link from "next/link";
import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { getBundleOriginalPrice, bundles as localBundles, type Bundle } from "@/data/bundles";

import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const dirs = [
  { x: -120, y: 0 },
  { x: 0, y: 120 },
  { x: 120, y: 0 },
];

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
      className="mb-6 flex items-start justify-center md:sticky md:top-[calc(var(--header-h)+2rem)] md:mb-0 md:h-[66svh] md:last:h-auto md:last:pb-16"
      style={{ paddingTop: index * 24 }}
    >
      <motion.article
        style={{ scale, opacity: dim }}
        className="grid w-full max-w-5xl origin-top gap-6 overflow-hidden rounded-3xl bg-background p-5 shadow-[0_20px_60px_-30px_var(--color-primary)] md:grid-cols-2 md:p-8"
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFF4F6]/50 to-secondary">
          {showStaticImage ? (
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
                alt={`${p.name} in ${bundle.name}`}
                loading="lazy"
                initial={
                  reduced
                    ? false
                    : included.length === 2
                    ? i === 0
                      ? { x: -90, y: 30, rotate: -6, opacity: 0 }
                      : { x: 90, y: 30, rotate: 6, opacity: 0 }
                    : { ...dirs[i % 3], opacity: 0 }
                }
                whileInView={{
                  x: 0,
                  y: 0,
                  rotate: included.length === 2 ? (i === 0 ? -2 : 2) : 0,
                  opacity: 1,
                }}
                viewport={{ once: true, amount: 0.15, margin: "0px 0px -30px 0px" }}
                transition={{
                  duration: 0.85,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`absolute bottom-0 rounded-t-2xl object-cover shadow-[0_12px_30px_rgba(0,0,0,0.12)] ${
                  included.length === 2 ? "h-[84%] w-[44%]" : "h-[78%] w-[44%]"
                }`}
                style={{
                  left:
                    included.length === 2
                      ? i === 0
                        ? "12%"
                        : "46%"
                      : `${6 + i * (included.length === 3 ? 25 : 44)}%`,
                  zIndex: i === 1 ? 2 : 1,
                }}
              />
            ))
          )}
          <motion.div
            initial={reduced ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.5, stiffness: 300, damping: 14 }}
            className="absolute left-3 top-3 z-10 flex gap-2"
          >
            <Badge variant="saving">
              Save {formatPKR(original - bundle.price)} ({bundle.savePercent}%)
            </Badge>
            {included.length === 3 && <Badge>Best Value</Badge>}
          </motion.div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Bundle {index + 1}</p>
          <h3 className="mt-2 text-2xl font-light text-foreground md:text-3xl"><Link href={`/bundles/${bundle.slug}`} className="hover:underline">{bundle.name}</Link></h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.description}</p>
          <ul className="mt-3 space-y-1 text-[15px] text-muted-foreground">
            {included.map((p) => (
              <li key={p.slug}>· {p.name}</li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline gap-3">
            <strong className="text-xl font-medium">{formatPKR(bundle.price)}</strong>
            <span className="text-sm text-muted-foreground line-through">
              {formatPKR(original)}
            </span>
          </p>
          <Link href={`/bundles/${bundle.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline underline-offset-4">View bundle details</Link>
          <Button className="mt-2 h-12" onClick={() => addBundle(bundle.slug)}>
            <ShoppingBag /> Add bundle
          </Button>
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
      <p className="eyebrow">Bundles</p>
      <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">
        Better together.
      </h2>
      <div ref={ref} className="mt-10 pb-8">
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
    </section>
  );
}
