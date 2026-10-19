import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative flex w-full flex-col overflow-hidden bg-[#f4d7df] text-primary"
      style={{
        paddingTop: "var(--header-h, 4rem)",
        minHeight: "100svh",
      }}
    >
      <div className="relative h-[calc(100svh-var(--header-h,4rem))] min-h-[560px] w-full flex-1 overflow-hidden">
        {/* Hero Product Image */}
        <motion.div
          className="absolute inset-x-0 bottom-16 h-[46%] w-full overflow-hidden sm:bottom-16 sm:h-[48%] md:bottom-0 md:h-[58%] lg:inset-0 lg:h-full"
          style={reducedMotion ? {} : { y: imageY }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/images/leva-pink-studio-hero.webp"
              alt="LEVA cream, tinted sunblock and face wash in a pink studio"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[92%_bottom] sm:object-[86%_bottom] md:object-[72%_bottom] lg:object-[64%_bottom] xl:object-[center_bottom]"
            />
          </div>
        </motion.div>

        {/* Hero Content (Text & CTA) */}
        <motion.div
          className="absolute left-6 top-3 z-20 flex max-w-[calc(100%-3rem)] flex-col sm:left-8 sm:top-5 sm:max-w-md md:left-12 md:top-8 lg:bottom-[12%] lg:left-[6%] lg:top-auto xl:bottom-[14%] xl:max-w-lg"
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
