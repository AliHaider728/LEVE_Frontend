import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

/** "The Essential Three": desktop pinned scene, vertical scroll drives a horizontal track. Mobile: snap swipe. */
export function FeaturedRise() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 85, damping: 26 });
  const x = useTransform(smoothProgress, [0, 1], [0, travel]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-featured-card]");
      const first = cards[0];
      const last = cards[cards.length - 1];
      if (!first || !last) return;
      const groupWidth = last.getBoundingClientRect().right - first.getBoundingClientRect().left;
      const sidePadding = track.clientWidth * 0.08;
      setTravel(Math.max(0, track.clientWidth - groupWidth - sidePadding * 2));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.querySelectorAll<HTMLElement>("[data-featured-card]").forEach((card) => observer.observe(card));
    document.fonts?.ready.then(measure);
    measure();
    return () => observer.disconnect();
  }, []);
  const head = (
    <div className="grid gap-4 px-5 sm:flex sm:items-end sm:justify-between md:px-[8vw]">
      <div>
        <p className="eyebrow">Featured</p>
        <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">
          The essential three.
        </h2>
      </div>
      <Button asChild variant="link">
        <Link to="/shop">
          View all <ArrowRight />
        </Link>
      </Button>
    </div>
  );
  return (
    <section aria-label="Featured products" className="bg-background">
      <div ref={ref} className={`relative hidden lg:block ${reduced ? "" : "h-[180svh]"}`}>
        <div
          className={`${reduced ? "py-16" : "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]"} flex flex-col justify-center gap-4 overflow-x-clip py-4`}
        >
          {head}
          <motion.div ref={trackRef} style={reduced ? {} : { x }} className="flex items-stretch gap-6 px-[8vw]">
            {products.map((p, i) => (
              <motion.div
                key={p.slug}
                data-featured-card
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.75, delay: i * 0.1, ease: "easeOut" }}
                className="w-[min(22vw,33svh,290px)] shrink-0"
              >
                <ProductCard product={p} featured />
              </motion.div>
            ))}
          </motion.div>
          {!reduced && (
            <div className="mx-[8vw] h-0.5 bg-primary/10">
              <motion.div
                className="h-full origin-left bg-accent"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="py-16 lg:hidden">
        {head}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
          {products.map((p) => (
            <div key={p.slug} className="w-[78vw] shrink-0 snap-center sm:w-[44vw]">
              <ProductCard product={p} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
