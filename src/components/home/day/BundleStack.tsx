import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { getBundleOriginalPrice, type Bundle } from "@/data/bundles";

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
  return (
    <div
      className="mb-6 flex items-start justify-center md:sticky md:top-[calc(var(--header-h)+2rem)] md:mb-0 md:h-[66svh] md:last:h-auto md:last:pb-16"
      style={{ paddingTop: index * 24 }}
    >
      <motion.article
        style={{ scale, opacity: dim }}
        className="grid w-full max-w-5xl origin-top gap-6 overflow-hidden rounded-3xl bg-background p-5 shadow-[0_20px_60px_-30px_var(--color-primary)] md:grid-cols-2 md:p-8"
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-secondary">
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
                alt={`${p.name} in ${bundle.name}`}
                loading="lazy"
                initial={reduced ? false : { ...dirs[i % 3], opacity: 0 }}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.12 }}
                className="absolute bottom-0 h-[78%] w-[44%] rounded-t-xl object-cover"
                style={{
                  left: `${6 + i * (included.length === 3 ? 25 : 44)}%`,
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
          <h3 className="mt-2 text-2xl font-light text-foreground md:text-3xl">{bundle.name}</h3>
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
          <Button className="mt-5 h-12" onClick={() => addBundle(bundle.slug)}>
            <ShoppingBag /> Add bundle
          </Button>
        </div>
      </motion.article>
    </div>
  );
}

export function BundleStack() {
  const { bundles } = useStoreData();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section aria-label="Bundles" className="bg-secondary px-5 pt-16 md:px-[8vw] md:pt-24">
      <p className="eyebrow">Bundles</p>
      <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">
        Better together.
      </h2>
      <div ref={ref} className="mt-10 pb-8">
        {bundles.map((b, i) => (
          <Card
            key={b.slug}
            bundle={b}
            index={i}
            total={bundles.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
