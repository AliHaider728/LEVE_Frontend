import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { editorialImages } from "@/lib/assets";

const text =
  "Skincare should feel like a quiet morning. Three honest steps, made for the way you really live.";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.35, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-40, 140]);
  const words = text.split(" ");
  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background px-5 py-16 md:px-[10vw] md:py-24"
    >
      <motion.img
        style={{ y: y1 }}
        src={editorialImages.closeup}
        alt="Close-up of skin texture"
        loading="lazy"
        className="absolute left-[3vw] top-16 hidden h-56 w-40 rounded-t-full object-cover lg:block"
      />
      <motion.img
        style={{ y: y2 }}
        src={editorialImages.portrait}
        alt="Woman in soft morning light"
        loading="lazy"
        className="absolute bottom-16 right-[4vw] hidden h-64 w-44 rounded-2xl object-cover lg:block"
      />
      <p className="eyebrow mb-8 text-center">Our belief</p>
      <h2 className="mx-auto max-w-4xl text-center text-3xl font-light leading-snug text-foreground md:text-5xl">
        {reduced
          ? text
          : words.map((w, i) => (
              <Word
                key={i}
                word={w}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              />
            ))}
      </h2>
    </section>
  );
}
