import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import { editorialImages } from "@/lib/assets";
import { CountUp } from "@/components/shop/CountUp";

const items = [
  {
    name: "Niacinamide",
    value: 5,
    unit: "%",
    benefit: "Helps even out tone and refine the look of pores.",
    img: editorialImages.closeup,
  },
  {
    name: "Hyaluronic Acid",
    value: 2,
    unit: "x",
    benefit: "Holds water in the skin for a plump, dewy feel.",
    img: editorialImages.hero,
  },
  {
    name: "Vitamin C",
    value: 10,
    unit: "%",
    benefit: "Brings back glow to tired, dull skin.",
    img: editorialImages.closeup,
  },
  {
    name: "Ceramides",
    value: 3,
    unit: " types",
    benefit: "Support the skin barrier so it stays calm.",
    img: editorialImages.portrait,
  },
];

function Panel({ it }: { it: (typeof items)[number] }) {
  return (
    <article className="grid w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl bg-background md:w-[60vw] md:grid-cols-2 lg:h-[min(54svh,470px)] lg:w-[min(43vw,610px)]">
      <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
        <img
          src={it.img}
          alt={`${it.name} texture`}
          loading="lazy"
          className="h-full w-full scale-110 object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="text-5xl font-light text-accent md:text-6xl">
          <CountUp value={it.value} />
          {it.unit}
        </p>
        <h3 className="mt-3 text-2xl font-light text-foreground">{it.name}</h3>
        <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{it.benefit}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Placeholder value. Final formula details coming soon.
        </p>
      </div>
    </article>
  );
}

export function Ingredients() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 75, damping: 28 });
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-62%"]);
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
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[190vh]"}`}>
        <div
          className={`${reduced ? "py-16" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-6 overflow-hidden py-6`}
        >
          {head}
          <motion.div
            style={reduced ? {} : { x }}
            className={`flex gap-8 pl-[8vw] ${reduced ? "flex-wrap pr-[8vw]" : ""}`}
          >
            {items.map((it) => (
              <Panel key={it.name} it={it} />
            ))}
          </motion.div>
        </div>
      </div>
      <div className="py-16 lg:hidden">
        {head}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {items.map((it) => (
            <Panel key={it.name} it={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
