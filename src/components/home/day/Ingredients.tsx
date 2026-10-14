import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";

const items = [
  {
    step: "01",
    name: "Skin Brightening Face Wash",
    ingredient: "Hyaluronic Acid",
    benefit: "Helps retain moisture for soft, fresh, and hydrated-looking skin.",
    howToUse: "Apply to a damp face, massage gently for 15–20 seconds, then rinse thoroughly.",
    img: "/images/leva-face-wash-formula.jpg",
  },
  {
    step: "02",
    name: "Skin Brightening Cream",
    ingredient: "Alpha Arbutin",
    benefit: "Helps reduce the appearance of dark spots and promotes a brighter, more even-looking skin tone.",
    howToUse: "Apply a small amount to clean skin once or twice daily.",
    img: "/images/leva-brightening-cream-formula.jpg",
  },
  {
    step: "SPF 50",
    name: "Tinted Sunscreen",
    ingredient: "UVA & UVB Protection",
    benefit: "Helps protect against sunburn, tanning, and premature skin aging.",
    howToUse: "Apply 15 minutes before sun exposure. Reapply every 2 hours outdoors.",
    img: "/images/leva-tinted-sunscreen-formula.jpg",
  },
];

function Panel({ it }: { it: (typeof items)[number] }) {
  return (
    <article className="grid w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl bg-background md:w-[60vw] md:grid-cols-2 lg:h-[min(54svh,470px)] lg:w-[min(43vw,610px)]">
      <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
        <img
          src={it.img}
          alt={`LEVA ${it.name}`}
          loading="lazy"
          className="h-full w-full scale-110 object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="text-sm font-semibold tracking-widest text-accent uppercase">
          {it.step}
        </p>
        <h3 className="mt-2 text-2xl font-light text-foreground">{it.name}</h3>
        <p className="mt-4 text-xs font-semibold tracking-wider text-foreground/70 uppercase">
          {it.ingredient}
        </p>
        <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{it.benefit}</p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground/70">How to Use:</span> {it.howToUse}
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
              <Panel key={it.step} it={it} />
            ))}
          </motion.div>
        </div>
      </div>
      <div className="py-16 lg:hidden">
        {head}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {items.map((it) => (
            <Panel key={it.step} it={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
