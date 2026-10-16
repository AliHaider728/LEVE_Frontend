import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
      name: "Iqra N.",
      city: "Rawalpindi",
      rating: 5,
      quote: "Gentle and refreshing. Doesn't strip moisture or feel tight at all!",
    },
  },
  Cream: {
    step: "Moisturize",
    stepTag: "Step 02 · Brighten & Hydrate",
    text: "Seal it in. Skin stays calm, bright and soft all day.",
    highlights: ["Alpha Arbutin", "Dark Spot Reduction", "Radiant Glow", "Featherlight"],
    fallbackReview: {
      name: "Ayesha K.",
      city: "Lahore",
      rating: 5,
      quote: "My skin feels so soft and glowing now. The cream is truly my favourite.",
    },
  },
  Sunscreen: {
    step: "Protect",
    stepTag: "Step 03 · Shield & Protect",
    text: "Finish with tinted SPF 50 PA+++ broad-spectrum defense.",
    highlights: ["SPF 50 PA+++", "UVA/UVB Defense", "Sheer Natural Tint", "Zero White Cast"],
    fallbackReview: {
      name: "Zara M.",
      city: "Karachi",
      rating: 5,
      quote: "Finally a tinted sunscreen in Pakistan with no white cast and a natural dewy finish.",
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
      r.product &&
      (r.product.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(r.product.toLowerCase()))
  );
  const activeReview = matchingReview && matchingReview.quote ? matchingReview : detail.fallbackReview;

  return (
    <div className="grid items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-secondary shadow-md md:col-span-5 md:max-w-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={p.slug}
            src={p.image}
            alt={p.name}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        {p.badge && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-md shadow-sm">
              <Sparkles className="size-3 text-accent" /> {p.badge}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 md:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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
                <span className="font-semibold text-foreground">{p.rating || 4.9}</span>
                <span className="text-[11px] text-muted-foreground">
                  ({p.reviewCount || 84} reviews)
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
  const [i, setI] = useState(0);

  const tabs = [
    { step: "01", label: "Cleanse & Prep" },
    { step: "02", label: "Brighten & Hydrate" },
    { step: "03", label: "Shield & Protect" },
  ];

  return (
    <section aria-label="The 3-step ritual" className="bg-background py-16 md:py-24 px-5 md:px-[8vw]">
      {/* Header and Step Switcher */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-primary/10 pb-6">
        <div>
          <p className="eyebrow">The 3-step ritual</p>
          <h2 className="mt-2 text-3xl font-light text-foreground md:text-4xl">
            Three honest steps. One ritual.
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab, idx) => {
            const active = i === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                    : "border border-primary/15 bg-primary/[0.02] text-foreground/75 hover:bg-primary/[0.06] hover:text-foreground"
                }`}
              >
                <span className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                  active ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {tab.step}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <Stage i={i} />

      {/* Visual Progress Line */}
      <div className="mt-10 flex items-center justify-center gap-3">
        {[0, 1, 2].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Switch to step ${n + 1}`}
            className="group py-2 cursor-pointer"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${
              n === i ? "w-16 bg-accent" : "w-10 bg-primary/15 group-hover:bg-primary/30"
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}
