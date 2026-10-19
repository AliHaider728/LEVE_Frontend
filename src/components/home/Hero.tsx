import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative flex w-full flex-col overflow-hidden bg-[#f4d7df] text-primary"
      style={{
        paddingTop: "var(--header-h, 4rem)",
        height: "100svh",
        minHeight: "420px",
      }}
    >
      <div className="relative h-full w-full flex-1 overflow-hidden">
        {/* Desktop Hero Product Image with bg-attachment fixed */}
        <div
          className="absolute inset-0 hidden bg-cover bg-no-repeat md:block md:bg-fixed bg-[center_bottom] lg:bg-[64%_bottom] xl:bg-[center_bottom]"
          style={{
            backgroundImage: "url('/images/leva-pink-studio-hero.webp')",
          }}
        />

        {/* Mobile Hero Product Image */}
        <div className="absolute inset-x-0 bottom-16 h-[46%] w-full overflow-hidden sm:bottom-16 sm:h-[48%] md:hidden">
          <div className="relative h-full w-full">
            <Image
              src="/images/leva-pink-studio-hero.webp"
              alt="LEVA cream, tinted sunblock and face wash in a pink studio"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[94%_bottom] sm:object-[88%_bottom]"
            />
          </div>
        </div>

        {/* Hero Content (Text & CTA) */}
        <motion.div
          className="absolute left-6 top-3 z-20 flex max-w-[calc(100%-3rem)] flex-col sm:left-8 sm:top-5 sm:max-w-md md:bottom-8 md:left-12 md:top-auto lg:bottom-10 lg:left-[6%] xl:bottom-14 xl:max-w-lg"
          initial={reducedMotion ? false : { y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 0.15, duration: reducedMotion ? 0 : 0.7 }}
        >
          <p className="eyebrow mb-2 text-xs font-medium uppercase tracking-[0.2em] sm:mb-3 sm:text-sm">
            Skincare for her
          </p>
          <h1 className="text-5xl font-light leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            LEVA
          </h1>
          <p className="mb-4 mt-2 max-w-xs text-xs font-light leading-relaxed text-primary/90 sm:mb-5 sm:mt-3 sm:max-w-sm sm:text-sm md:text-base">
            A softer kind of strength, worn on the skin.
          </p>
          <div>
            <Button
              asChild
              className="group h-10 bg-primary px-5 text-xs font-medium text-white hover:bg-primary/90 hover:text-white sm:h-11 sm:px-6 sm:text-sm"
            >
              <Link to="/shop">
                Shop now{" "}
                <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
