import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 0.18], [0, 90]);
  const reducedMotion = useReducedMotion();
  return (
    <section className="relative h-svh min-h-[680px] overflow-hidden bg-[#f4d7df] text-primary">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={reducedMotion ? false : { clipPath: "inset(45% 35% 45% 35%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: reducedMotion ? 0 : 1.25, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.img
          style={reducedMotion ? {} : { y: imageY }}
          src="/images/leva-pink-studio-hero.webp"
          alt="LEVA cream, tinted sunblock and face wash in a pink studio"
          className="absolute bottom-0 h-[56%] w-full object-cover object-[76%_center] [mask-image:linear-gradient(to_bottom,transparent,black_16%)] md:bottom-auto md:h-[115%] md:object-[60%_center] md:[mask-image:none]"
          fetchPriority="high"
        />
      </motion.div>
      <motion.div
        className="absolute left-6 top-[12%] z-20 max-w-[calc(100%-3rem)] text-primary md:bottom-[14%] md:left-[5%] md:top-auto md:max-w-[calc(100%-6rem)] md:text-primary"
        initial={reducedMotion ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 0.55, duration: reducedMotion ? 0 : 0.8 }}
      >
        <p className="eyebrow mb-5">Skincare for her</p>
        <h1 className="text-7xl font-light leading-none md:text-8xl lg:text-9xl">LEVA</h1>
        <p className="mb-6 mt-6 max-w-xs text-base font-light leading-relaxed md:max-w-sm">
          A softer kind of strength, worn on the skin.
        </p>
        <Button asChild className="bg-primary text-white hover:bg-primary/90 hover:text-white">
          <Link to="/shop">
            Shop now <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
