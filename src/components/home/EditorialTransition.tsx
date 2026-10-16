import { motion } from "motion/react";
import { editorialImages } from "@/lib/assets";

export function EditorialTransition() {
  return (
    <section className="relative h-[115vh] overflow-hidden bg-primary">
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(12% 20%)" }}
        whileInView={{ clipPath: "inset(0% 0%)" }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      >
        <img
          src={editorialImages.skin}
          alt="Close-up of radiant skin"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
      </motion.div>
      <p className="absolute bottom-8 left-6 max-w-sm text-4xl font-light text-primary-foreground md:left-10 md:text-6xl">
        Nothing extra.
        <br />
        Everything considered.
      </p>
    </section>
  );
}
