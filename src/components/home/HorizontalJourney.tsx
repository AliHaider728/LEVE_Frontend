import { useEffect, useRef } from "react";
import { Link } from "@/lib/router-compat";
import { products } from "@/data/products";
import { ProductVessel } from "@/components/product/ProductVessel";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HorizontalJourney() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !section.current || !track.current) return;
    let cleanup = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      const gsap = g.default;
      const ST = s.ScrollTrigger;
      gsap.registerPlugin(ST);
      const media = gsap.matchMedia();
      media.add("(min-width: 768px)", () => {
        const ctx = gsap.context(() => {
          gsap.to(track.current, {
            x: () => -(track.current?.scrollWidth ?? 0) + window.innerWidth,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth)}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }, section);
        return () => ctx.revert();
      });
      const refresh = () => ST.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
      cleanup = () => {
        window.removeEventListener("load", refresh);
        media.revert();
      };
    });
    return () => cleanup();
  }, [reduced]);
  return (
    <section
      ref={section}
      className="overflow-hidden bg-primary py-20 text-primary-foreground md:h-svh md:py-0"
    >
      <div
        ref={track}
        className="flex snap-x snap-mandatory overflow-x-auto md:h-full md:w-max md:overflow-visible"
      >
        {products.map((product, index) => (
          <article
            key={product.slug}
            className="grid min-w-[88vw] snap-center content-center gap-8 border-r border-primary-foreground/15 px-6 md:min-w-[72vw] md:grid-cols-[.7fr_1fr] md:items-center md:px-[8vw]"
          >
            <div>
              <p className="eyebrow mb-8 text-primary-foreground/80">Chapter 0{index + 1}</p>
              <h3 className="text-5xl font-light md:text-8xl">{product.ritual}</h3>
              <p className="mt-8 max-w-sm text-base leading-7 text-primary-foreground/80">
                {product.description}
              </p>
              <Link
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="mt-8 inline-flex min-h-11 items-center border-b text-xs font-medium uppercase tracking-wider"
              >
                Meet {product.name}
              </Link>
            </div>
            <ProductVessel
              number={product.number}
              className="mx-auto w-44 border-primary-foreground/20 md:w-64"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
