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
import { Link } from "@/lib/router-compat";
import { Star, CheckCircle2, ShieldCheck, Truck, ArrowRight, Sparkles } from "lucide-react";

const order = ["Cleanser", "Cream", "Sunscreen"] as const;

const stepDetails = {
  Cleanser: {
    step: "Cleanse",
    stepTag: "Step 01 · Cleanse & Prep",
    text: "Start soft. Wash away the night without stripping your skin.",
    highlights: ["Hyaluronic Acid", "Sulfate-Free", "Gentle Purifying", "All Skin Types"],
    fallbackReview: {
      name: "Hania Aslam",
      city: "",
      rating: 5,
      quote: "Face wash use karna easy hai aur washing ke baad fresh feel hota hai. Daily routine mein easily include ho jata hai.",
    },
  },
  Cream: {
    step: "Moisturize",
    stepTag: "Step 02 · Brighten & Hydrate",
    text: "Seal it in. Skin stays calm, bright and soft all day.",
    highlights: ["Alpha Arbutin", "Dark Spot Reduction", "Radiant Glow", "Featherlight"],
    fallbackReview: {
      name: "Ayesha Malik",
      city: "",
      rating: 5,
      quote: "Cream achi hai, texture bhi soft hai. Daily skincare routine mein easily use ho jati hai.",
    },
  },
  Sunscreen: {
    step: "Protect",
    stepTag: "Step 03 · Shield & Protect",
    text: "Finish with tinted SPF 50 PA+++ broad-spectrum defense.",
    highlights: ["SPF 50 PA+++", "UVA/UVB Defense", "Sheer Natural Tint", "Zero White Cast"],
    fallbackReview: {
      name: "Zainab Ahmed",
      city: "",
      rating: 5,
      quote: "Tinted finish achi hai, apply karna bhi easy hai. Mujhe iska lightweight texture pasand aya.",
    },
  },
};

function Stage({ i }: { i: number }) {
  const { products, reviews } = useStoreData();
  const add = useCart((s) => s.add);
  const p = products.find((x) => x.type === order[i]) ?? products[i] ?? products[0]!;
  const detail = stepDetails[order[i]!];

  const matchingReview = reviews?.find(
    (r) =>
      r.rating === 5 &&
      r.product &&
      (r.product.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(r.product.toLowerCase()))
  );
  const activeReview = matchingReview && matchingReview.quote ? matchingReview : detail.fallbackReview;

  return (
    <div className="grid items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
      <Link
        to="/shop/$slug"
        params={{ slug: p.slug }}
        className="group relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-secondary shadow-md md:col-span-5 md:max-w-none cursor-pointer"
        aria-label={`View ${p.name} details`}
      >
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </AnimatePresence>
        {p.badge && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-md shadow-sm">
              <Sparkles className="size-3 text-accent" /> {p.badge}
            </span>
          </div>
        )}
      </Link>

      <div className="min-w-0 md:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="eyebrow font-semibold tracking-wider text-accent">
                  {detail.stepTag}
                </span>
                {p.size && (
                  <span className="rounded-full border border-primary/10 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                    {p.size}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-foreground">
                  {p.rating ? Number(p.rating).toFixed(1) : "5.0"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({p.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <h3 className="mt-2 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              {p.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {detail.text}
            </p>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {detail.highlights.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-primary/10 bg-primary/[0.03] px-2.5 py-1 text-[11px] font-medium text-foreground/80"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/[0.02] p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(activeReview.rating || 5)].map((_, idx) => (
                    <Star key={idx} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-[11px] font-medium text-foreground/70">
                    {(activeReview.rating || 5).toFixed(1)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 className="size-3" /> Verified Buyer
                </span>
              </div>
              <p className="mt-1.5 text-xs italic leading-relaxed text-foreground/85">
                &ldquo;{activeReview.quote}&rdquo;
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                — {activeReview.name}{activeReview.city ? `, ${activeReview.city}` : ""}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                className="h-11 px-6 font-medium bg-primary text-white hover:bg-primary/90 hover:text-white shadow-sm transition-all"
                onClick={() => add(p.slug)}
              >
                Add · {formatPKR(p.price)}
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-primary/20 px-5 font-normal text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Link to="/shop/$slug" params={{ slug: p.slug }}>
                  View details <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="size-3.5 text-accent" /> Free delivery over Rs. 3,500
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-accent" /> Cash on Delivery available
              </span>
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
