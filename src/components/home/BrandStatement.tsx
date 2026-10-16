import { motion } from "motion/react";

const words =
  "Skin remembers the rituals we choose to repeat. LEVA makes each one feel intentional.".split(
    " ",
  );
export function BrandStatement() {
  return (
    <section className="px-5 py-28 md:px-[8vw] md:py-44">
      <p className="eyebrow mb-12">01 / Our point of view</p>
      <h2 className="max-w-6xl font-display text-5xl leading-[1.02] md:text-8xl">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-[.25em] inline-block"
            initial={{ opacity: 0.15, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ delay: index * 0.025 }}
          >
            {word}
          </motion.span>
        ))}
      </h2>
    </section>
  );
}
