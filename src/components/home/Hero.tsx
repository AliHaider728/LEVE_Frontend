import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative flex min-h-[calc(100svh-var(--header-h,4rem))] w-full flex-col overflow-hidden bg-[#5a323a] text-primary md:min-h-[520px]"
      style={{ paddingTop: "var(--header-h, 4rem)" }}
    >
      {/* ── Desktop hero (≥768px) ── */}
      <div
        className="relative hidden w-full flex-1 overflow-hidden bg-[#5a323a] md:flex md:min-h-[500px] lg:min-h-[540px] xl:min-h-[580px]"
        style={{ height: "calc(88vh - var(--header-h, 7rem))", maxHeight: "640px" }}
      >
        {/* Simple fade-in only — zero layout shift, no scale, no clipPath */}
        <motion.div
          className="absolute inset-0"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="h-full w-full bg-cover bg-no-repeat md:bg-fixed bg-[center_bottom] lg:bg-[64%_bottom] xl:bg-[center_bottom]"
            style={{ backgroundImage: "url('/images/leva-pink-studio-hero.webp')" }}
          />
        </motion.div>
        <motion.div
          className="absolute top-12 left-8 z-20 flex max-w-md flex-col sm:top-14 sm:left-10 md:top-16 md:left-12 lg:top-20 lg:left-[6%] xl:top-24 xl:max-w-lg"
          initial={reducedMotion ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-3 text-sm font-medium uppercase tracking-[0.2em]">
            Skincare for her
          </p>
          <h1 className="text-7xl font-light leading-none tracking-tight lg:text-8xl xl:text-9xl">
            LEVA
          </h1>
          <p className="mb-6 mt-4 max-w-md text-sm font-light leading-relaxed text-primary/90 md:text-base">
            A softer kind of strength, worn on the skin. Considered daily rituals formulated to cleanse, hydrate, and protect her natural glow.
          </p>
          <div>
            <Button
              asChild
              className="group h-12 bg-primary px-8 text-sm font-medium text-white shadow-sm hover:bg-primary/90 hover:text-white"
            >
              <Link to="/shop">
                Shop now{" "}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile hero (<768px) ── */}
      <div
        className="relative flex w-full flex-col justify-between overflow-hidden md:hidden"
        style={{ minHeight: "560px", height: "calc(100svh - var(--header-h, 4rem))" }}
      >
        {/* Background image — opacity only, no scale to avoid layout shift */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src="/images/leva-mobile-hero-collection.webp"
            alt="LEVA Pink Glow Skincare Collection mobile view"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[center_bottom]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f4d7df]/90 via-[#f4d7df]/35 to-transparent pointer-events-none" />
        </motion.div>

        {/* Overlaid text */}
        <motion.div
          className="relative z-10 px-5 pt-6 sm:px-8 sm:pt-8"
          initial={reducedMotion ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-2 text-[12px] font-medium uppercase tracking-[0.2em] text-primary sm:text-[13px]">
            Skincare for her
          </p>
          <h1
            className="font-light leading-none tracking-tight text-primary"
            style={{ fontSize: "clamp(64px, 20vw, 96px)" }}
          >
            LEVA
          </h1>
          <p className="mb-4 mt-2 max-w-xs text-[15px] font-light leading-relaxed text-primary/90 sm:text-[17px]">
            A softer kind of strength, worn on the skin. Considered daily rituals to cleanse, hydrate, and protect her glow.
          </p>
          <Button
            asChild
            className="group h-[50px] bg-primary px-6 text-[14px] font-medium text-white shadow-md hover:bg-primary/90 hover:text-white sm:h-[52px] sm:text-[15px]"
          >
            <Link to="/shop">
              Shop now{" "}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Bottom breathing space */}
        <div className="relative z-10 h-24 sm:h-32 pointer-events-none" />
      </div>
    </section>
  );
}
