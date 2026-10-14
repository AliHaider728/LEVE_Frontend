import Link from "next/link";
import { useStoreData } from "@/store/catalog";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ShoppingBag } from "lucide-react";
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
  return (
    <article className="grid w-[86vw] shrink-0 snap-center gap-6 rounded-3xl bg-background p-5 md:w-[min(900px,70vw)] md:grid-cols-[1.1fr_1fr] md:p-8">
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
              initial={{ x: (i - (included.length - 1) / 2) * 140, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1 }}
              className="absolute bottom-0 h-[78%] w-[44%] rounded-t-xl object-cover"
              style={{
                left: `${8 + i * (included.length === 3 ? 24 : 40)}%`,
                zIndex: i === 1 ? 2 : 1,
              }}
            />
          ))
        )}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Badge variant="saving">Save {formatPKR(original - bundle.price)}</Badge>
          {bundle.productSlugs.length === 3 && <Badge>Best Value</Badge>}
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="eyebrow">{included.length} products</p>
        <h3 className="mt-2 text-2xl font-light md:text-3xl"><Link href={`/bundles/${bundle.slug}`} className="hover:underline">{bundle.name}</Link></h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.description}</p>
        <ul className="mt-3 space-y-1 text-[15px] text-muted-foreground">
          {included.map((p) => (
            <li key={p.slug}>· {p.name}</li>
          ))}
        </ul>
        <p className="mt-4 flex items-baseline gap-3">
          <strong className="text-xl font-medium">{formatPKR(bundle.price)}</strong>
          <span className="text-sm text-muted-foreground line-through">{formatPKR(original)}</span>
        </p>
        <Link href={`/bundles/${bundle.slug}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4">View bundle details</Link>
        <Button className="mt-2 h-12" onClick={() => addBundle(bundle.slug)}>
          <ShoppingBag /> Add bundle
        </Button>
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
    <div className="px-5 md:px-[6vw]">
        <p className="eyebrow text-primary-foreground/80">Bundles</p>
      <h2 className="mt-2 text-3xl font-light text-primary-foreground md:text-[2.75rem]">
        Save more with a ritual.
      </h2>
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
      </div>
    </section>
  );
}
