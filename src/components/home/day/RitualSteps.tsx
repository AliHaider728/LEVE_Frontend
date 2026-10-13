import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useReducedMotion,
} from "motion/react";
import { useStoreData } from "@/store/catalog";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

const order = ["Cleanser", "Cream", "Sunscreen"] as const;
const copy = {
  Cleanser: {
    step: "Cleanse",
    text: "Start soft. Wash away the night without stripping your skin.",
  },
  Sunscreen: { step: "Protect", text: "Finish with tinted SPF 50 PA+++ protection." },
  Cream: { step: "Moisturize", text: "Seal it in. Skin stays calm, bright and soft all day." },
};

function Stage({ i }: { i: number }) {
  const { products } = useStoreData();
  const add = useCart((s) => s.add);
  const p = products.find((x) => x.type === order[i]) ?? products[0]!;
  const c = copy[order[i]!];
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-secondary">
        <AnimatePresence initial={false}>
          <motion.img
            key={p.slug}
            src={p.image}
            alt={p.name}
            loading="lazy"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(75% at 50% 50%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45 }}
          >
            <p className="eyebrow">
              Step {i + 1} · {c.step}
            </p>
            <h3 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">{p.name}</h3>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">{c.text}</p>
            <div className="mt-6 flex items-center gap-4">
              <Button className="h-12" onClick={() => add(p.slug)}>
                Add · {formatPKR(p.price)}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function RitualSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setI(Math.min(2, Math.floor(v * 3))));
  return (
    <section aria-label="The 3-step ritual" className="bg-background">
      {/* Desktop pinned */}
      <div ref={ref} className={`relative hidden md:block ${reduced ? "" : "h-[300vh]"}`}>
        <div
          className={`${reduced ? "py-24" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center px-[8vw]`}
        >
          <p className="eyebrow mb-8">The 3-step ritual</p>
          {reduced ? (
            <div className="grid gap-24">
              {[0, 1, 2].map((n) => (
                <Stage key={n} i={n} />
              ))}
            </div>
          ) : (
            <Stage i={i} />
          )}
          {!reduced && (
            <div className="mt-8 flex items-center gap-3" aria-hidden>
              {[0, 1, 2].map((n) => (
                <span key={n} className="h-0.5 w-16 overflow-hidden bg-primary/15">
                  <motion.span
                    className="block h-full bg-accent"
                    animate={{ scaleX: n <= i ? 1 : 0 }}
                    style={{ originX: 0 }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Mobile stacked */}
      <div className="grid gap-20 px-5 py-20 md:hidden">
        <p className="eyebrow">The 3-step ritual</p>
        {[0, 1, 2].map((n) => (
          <Stage key={n} i={n} />
        ))}
      </div>
    </section>
  );
}
