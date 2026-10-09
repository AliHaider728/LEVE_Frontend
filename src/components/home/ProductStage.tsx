import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { products } from "@/data/products";
import { formatPKR } from "@/config/store";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type P = (typeof products)[number];

function Actions({ slug, small }: { slug: string; small?: boolean }) {
  const addMany = useCart((s) => s.addMany);
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => addMany(slug, 1)} size={small ? "sm" : "lg"} className="min-h-11">
        Add to Cart
      </Button>
      {!small && (
        <Button asChild variant="outline" size="lg" className="min-h-11">
          <Link to="/shop/$slug" params={{ slug }}>
            View product
          </Link>
        </Button>
      )}
    </div>
  );
}

function TextBlock({ p, i }: { p: P; i: number }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="stage-num pointer-events-none absolute -top-8 right-0 select-none text-[9rem] font-light leading-none text-transparent opacity-20 [-webkit-text-stroke:1px_var(--color-primary)]"
      >
        {p.number}
      </span>
      <div className="relative">
        <p className="stage-line eyebrow mb-4">{String(i + 1).padStart(2, "0")} / 03</p>
        <h3 className="stage-line text-4xl font-light leading-tight text-foreground lg:text-6xl">
          {p.name}
        </h3>
        <p className="stage-line mt-4 max-w-md text-base leading-7 text-muted-foreground">
          {p.benefit}
        </p>
        <p className="stage-line mt-4 text-xl font-medium text-foreground">{formatPKR(p.price)}</p>
        <div className="stage-line mt-6">
          <Actions slug={p.slug} />
        </div>
      </div>
    </div>
  );
}

function Img({ p, onLoad, eager }: { p: P; onLoad?: () => void; eager?: boolean }) {
  return (
    <img
      src={p.image}
      alt={`${p.name} by LEVA`}
      loading={eager ? "eager" : "lazy"}
      onLoad={onLoad}
      className="h-full w-full object-cover"
    />
  );
}

export function ProductStage() {
  const section = useRef<HTMLElement>(null);
  const refreshRef = useRef<() => void>(() => {});
  const [active, setActive] = useState(0);
  const [dot, setDot] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !section.current) return;
    let cleanup = () => {};
    let alive = true;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      if (!alive) return;
      const gsap = g.default;
      const ST = s.ScrollTrigger;
      gsap.registerPlugin(ST);
      const media = gsap.matchMedia();
      media.add("(min-width: 1024px)", () => {
        const ctx = gsap.context(() => {
          const imgs = gsap.utils.toArray<HTMLElement>(".stage-img");
          const texts = gsap.utils.toArray<HTMLElement>(".stage-text");
          const finale = section.current!.querySelector(".stage-finale");
          const slides = section.current!.querySelector(".stage-slides");
          gsap.set([...imgs.slice(1), ...texts.slice(1)], { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(imgs.slice(1), { clipPath: "inset(100% 0 0 0)" });
          gsap.set(imgs[0]!, { clipPath: "inset(0% 0 0 0)" });
          gsap.set(finale, { autoAlpha: 0, y: 30, pointerEvents: "none" });
          const header = getComputedStyle(document.documentElement)
            .getPropertyValue("--header-h")
            .trim();
          const headerPx = parseFloat(header) * (header.endsWith("rem") ? 16 : 1) || 112;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section.current,
              start: `top top+=${headerPx}`,
              end: "+=200%",
              pin: true,
              pinSpacing: true,
              scrub: 1.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => setActive(Math.min(2, Math.floor(self.progress * 3.3))),
            },
          });
          products.forEach((_, i) => {
            const img = imgs[i]!;
            const text = texts[i]!;
            const lines = text.querySelectorAll(".stage-line");
            if (i > 0) {
              tl.set([img, text], { autoAlpha: 1, pointerEvents: "auto" });
              tl.fromTo(
                img,
                { clipPath: "inset(100% 0 0 0)" },
                { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power2.out" },
              );
              tl.fromTo(
                img.querySelector("img"),
                { scale: 1.15 },
                { scale: 1, duration: 1.2, ease: "power2.out" },
                "<",
              );
              tl.fromTo(
                lines,
                { y: 40, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.8, ease: "power2.out" },
                "<",
              );
            }
            tl.to({}, { duration: 1.6 });
            tl.to(img, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "none" });
            tl.to(
              lines,
              { y: -24, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: "none" },
              "<",
            );
            tl.set([img, text], { autoAlpha: 0, pointerEvents: "none" });
          });
          tl.set(slides, { autoAlpha: 0 });
          tl.to(finale, {
            autoAlpha: 1,
            y: 0,
            pointerEvents: "auto",
            duration: 0.8,
            ease: "power2.out",
          });
          tl.to({}, { duration: 0.6 });
        }, section);
        return () => ctx.revert();
      });
      const refresh = () => ST.refresh();
      refreshRef.current = refresh;
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
      window.addEventListener("resize", refresh);
      cleanup = () => {
        window.removeEventListener("load", refresh);
        window.removeEventListener("resize", refresh);
        media.revert();
      };
    });
    return () => {
      alive = false;
      cleanup();
    };
  }, [reduced]);

  const onLoad = () => refreshRef.current();
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setDot(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <section ref={section} aria-label="The essential three" className="relative bg-background">
      {/* Desktop pinned stage */}
      {!reduced && (
        <div className="relative hidden h-[calc(100svh-var(--header-h))] px-8 py-6 lg:block">
          <div className="stage-slides mx-auto grid h-full max-w-6xl grid-cols-2 gap-10">
            <div className="relative grid h-full place-items-center">
              {products.map((p, i) => (
                <div
                  key={p.slug}
                  className="stage-img relative col-start-1 row-start-1 aspect-[4/5] h-full max-h-[min(64svh,560px)] max-w-full overflow-hidden rounded-2xl bg-secondary"
                  style={i ? { opacity: 0, visibility: "hidden" } : undefined}
                >
                  <Img p={p} onLoad={onLoad} />
                </div>
              ))}
            </div>
            <div className="relative grid h-full items-center">
              {products.map((p, i) => (
                <div
                  key={p.slug}
                  className="stage-text col-start-1 row-start-1"
                  style={i ? { opacity: 0, visibility: "hidden" } : undefined}
                >
                  <TextBlock p={p} i={i} />
                </div>
              ))}
            </div>
          </div>
          <div
            className="stage-finale absolute inset-0 flex flex-col justify-center px-8 opacity-0"
            style={{ visibility: "hidden" }}
          >
            <div className="mx-auto w-full max-w-5xl py-6">
              <div className="mb-5 flex items-end justify-between gap-6">
                <h3 className="text-3xl font-light text-foreground">The complete LEVA ritual</h3>
                <Button asChild size="lg" className="min-h-11">
                  <Link to="/shop">Shop all</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {products.map((p) => (
                  <div key={p.slug}>
                    <Link
                      to="/shop/$slug"
                      params={{ slug: p.slug }}
                      className="block aspect-[4/5] max-h-[min(31svh,280px)] w-full overflow-hidden rounded-xl bg-secondary"
                    >
                      <Img p={p} onLoad={onLoad} />
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPKR(p.price)}</p>
                      </div>
                      <Actions slug={p.slug} small />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-6 left-8 flex items-center gap-4 text-xs font-medium text-foreground"
            aria-hidden
          >
            {products.map((p, i) => (
              <span
                key={p.slug}
                className={
                  i === active
                    ? "text-primary underline underline-offset-4"
                    : "text-muted-foreground"
                }
              >
                {p.number}
              </span>
            ))}
            <span className="relative h-px w-24 bg-primary/20">
              <span
                className="absolute inset-y-0 left-0 bg-primary transition-[width]"
                style={{ width: `${((active + 1) / 3) * 100}%` }}
              />
            </span>
          </div>
        </div>
      )}

      {/* Mobile carousel / reduced motion stack */}
      <div className={reduced ? "px-5 py-20" : "py-16 pb-24 lg:hidden"}>
        <p className="eyebrow mb-6 px-5">The essential three</p>
        <div
          onScroll={onScroll}
          className={
            reduced
              ? "mx-auto grid max-w-5xl gap-16"
              : "flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          }
        >
          {products.map((p, i) => (
            <article
              key={p.slug}
              className={reduced ? "grid gap-8 md:grid-cols-2" : "w-full shrink-0 snap-center px-5"}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary sm:mx-auto sm:max-w-md">
                <Img p={p} />
              </div>
              <div className="mt-6">
                <TextBlock p={p} i={i} />
              </div>
            </article>
          ))}
        </div>
        {!reduced && (
          <div className="mt-6 flex justify-center gap-2" aria-hidden>
            {products.map((p, i) => (
              <span
                key={p.slug}
                className={`h-2 rounded-full transition-all ${i === dot ? "w-6 bg-primary" : "w-2 bg-primary/30"}`}
              />
            ))}
          </div>
        )}
        {reduced && (
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg">
              <Link to="/shop">Shop all</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
