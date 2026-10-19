import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Hero() {

  return (
    <section
      className="relative flex min-h-[calc(100svh-var(--header-h,4rem))] w-full flex-col overflow-hidden bg-[#f4d7df] text-primary md:min-h-[520px]"
      style={{
        paddingTop: "var(--header-h, 4rem)",
      }}
    >
      {/* ── Desktop hero (≥768px): fixed parallax image ── */}
      <div
        className="relative hidden w-full flex-1 overflow-hidden md:flex md:min-h-[500px] lg:min-h-[540px] xl:min-h-[580px]"
        style={{
          height: "calc(88vh - var(--header-h, 7rem))",
          maxHeight: "640px",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-no-repeat md:bg-fixed bg-[center_bottom] lg:bg-[64%_bottom] xl:bg-[center_bottom]"
          style={{
            backgroundImage: "url('/images/leva-pink-studio-hero.webp')",
          }}
        />
        <motion.div
          className="absolute bottom-8 left-10 z-20 flex max-w-md flex-col lg:bottom-12 lg:left-[6%] xl:bottom-14 xl:max-w-lg"
          initial={false}
          animate={{ y: 0, opacity: 1 }}
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

      {/* ── Mobile hero (<768px): background image with text overlaid on top ── */}
      <div
        className="relative flex w-full flex-col justify-between overflow-hidden md:hidden"
        style={{
          minHeight: "560px",
          height: "calc(100svh - var(--header-h, 4rem))",
        }}
      >
        {/* Background image container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/leva-mobile-hero-collection.webp"
            alt="LEVA Pink Glow Skincare Collection mobile view"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[center_bottom]"
          />
          {/* Subtle gradient overlay to keep text ultra-crisp while bottles remain vivid */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f4d7df]/90 via-[#f4d7df]/35 to-transparent pointer-events-none" />
        </div>

        {/* Overlaid text block */}
        <div className="relative z-10 px-5 pt-6 sm:px-8 sm:pt-8">
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
        </div>

        {/* Bottom breathing space so bottles at bottom remain visible */}
        <div className="relative z-10 h-24 sm:h-32 pointer-events-none" />
      </div>
    </section>
  );
}
