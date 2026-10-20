import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import { Link } from "@/lib/router-compat";
import { useStoreData } from "@/store/catalog";

const items = [
  {
    step: "01",
    name: "LEVA Face Wash",
    slug: "leva-face-wash",
    ingredient: "Hyaluronic Acid",
    benefit: "A gentle, purifying daily face wash that deeply cleanses pores without stripping natural moisture, leaving skin fresh, soft, and balanced.",
    howToUse: "Apply to a damp face, massage gently for 15–20 seconds, then rinse thoroughly.",
    img: "https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/leva-face-wash-formula.jpg",
  },
  {
    step: "02",
    name: "LEVA Brightening Cream",
    slug: "leva-brightening-cream",
    ingredient: "Alpha Arbutin & Ceramides",
    benefit: "A fast-absorbing daily moisturizer enriched with ceramides, hyaluronic acid, and alpha arbutin to replenish moisture, restore the skin barrier, and reveal a radiant glow.",
    howToUse: "Apply a small amount to clean skin once or twice daily.",
    img: "https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/leva-brightening-cream-formula.jpg",
  },
  {
    step: "SPF 50",
    name: "LEVA Tinted Sunblock",
    slug: "leva-tinted-sunblock",
    ingredient: "UVA & UVB Protection",
    benefit: "Broad-spectrum SPF 50 PA+++ protection with a sheer universal tint for a radiant, non-greasy finish without white cast.",
    howToUse: "Apply 15 minutes before sun exposure. Reapply every 2 hours outdoors.",
    img: "https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/leva-tinted-sunscreen-formula.jpg",
  },
];

function Panel({ it }: { it: (typeof items)[number] }) {
  return (
    <article className="grid w-[84vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-3xl bg-background shadow-sm sm:max-w-[400px] md:w-[60vw] md:max-w-none md:grid-cols-2 lg:h-[min(54svh,470px)] lg:w-[min(43vw,610px)]">
      <Link
        to="/shop/$slug"
        params={{ slug: it.slug }}
        className="group block aspect-[4/3] overflow-hidden md:aspect-auto cursor-pointer"
        aria-label={`View ${it.name} details`}
      >
        <img
          src={it.img}
          alt={`LEVA ${it.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col justify-center p-5 sm:p-6 md:p-8">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase sm:text-sm">
          {it.step}
        </p>
        <h3 className="mt-1.5 text-xl font-light text-foreground sm:text-2xl">
          <Link to="/shop/$slug" params={{ slug: it.slug }} className="hover:underline">
            {it.name}
          </Link>
        </h3>
        <p className="mt-3 text-[11px] font-semibold tracking-wider text-foreground/70 uppercase sm:text-xs">
          {it.ingredient}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{it.benefit}</p>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          <span className="font-semibold text-foreground/70">How to Use:</span> {it.howToUse}
        </p>
      </div>
    </article>
  );
}

export function Ingredients() {
  const { products } = useStoreData();
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 75, damping: 28 });
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-62%"]);

  const dynamicItems = items.map((it) => {
    const liveProd = products.find(
      (p) =>
        p.slug === it.slug ||
        (it.slug === "leva-brightening-cream" && (p.slug === "leva-cream" || p.name.toLowerCase().includes("cream"))) ||
        p.name.toLowerCase().includes(it.name.toLowerCase().replace("leva ", ""))
    );
    return {
      ...it,
      name: liveProd?.name || it.name,
      slug: liveProd?.slug || it.slug,
      benefit: liveProd?.benefit || liveProd?.description || it.benefit,
      howToUse: liveProd?.usage || it.howToUse,
    };
  });

  // Track active slide on mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.firstElementChild?.clientWidth ?? 1;
      const idx = Math.round(scrollLeft / (cardWidth + 16));
      setActiveIdx(Math.max(0, Math.min(items.length - 1, idx)));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const head = (
    <div className="px-5 md:px-[8vw]">
      <p className="eyebrow">Inside the formula</p>
      <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">
        What makes it work.
      </h2>
    </div>
  );

  return (
    <section aria-label="Ingredients" className="bg-secondary">
      {/* Desktop horizontal pinning */}
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[190vh]"}`}>
        <div
          className={`${reduced ? "py-16" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-6 overflow-hidden py-6`}
        >
          {head}
          <motion.div
            style={reduced ? {} : { x }}
            className={`flex gap-8 pl-[8vw] ${reduced ? "flex-wrap pr-[8vw]" : ""}`}
          >
            {dynamicItems.map((it) => (
              <Panel key={it.step} it={it} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile/Tablet native swipe carousel */}
      <div className="py-14 lg:hidden">
        {head}
        <div
          ref={scrollRef}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
            overscrollBehaviorX: "contain",
          }}
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none]"
        >
          {dynamicItems.map((it) => (
            <Panel key={it.step} it={it} />
          ))}
        </div>

        {/* Slide dot indicators */}
        <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const cardWidth = el.firstElementChild?.clientWidth ?? 1;
                el.scrollTo({ left: i * (cardWidth + 16), behavior: "smooth" });
              }}
              className={`size-2 rounded-full transition-all duration-300 ${
                activeIdx === i ? "w-6 bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
