"use client";

import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { motion, useReducedMotion } from "motion/react";

export function BuildBundleCard() {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: reduced ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <Link
      to="/bundles/build"
      className="group relative flex h-full min-h-[360px] min-w-0 flex-col justify-between overflow-hidden rounded-md border border-primary/20 bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 sm:min-h-[420px] sm:p-6"
      aria-label="Build your own bundle — Choose any 2 products to save 10%, or any 3 to save 20%"
    >
      {/* Subtle decorative background gradient */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-125"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 flex flex-col gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={containerVariants}
      >
        {/* Top Eyebrow & Sparkle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white sm:text-xs">
            <Sparkles className="size-3 text-accent" /> Custom Routine
          </span>
          <span className="text-[11px] font-medium text-white/70">Up to 20% off</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={itemVariants}>
          <h3 className="font-heading text-xl font-light leading-snug sm:text-2xl">
            Build your own bundle
          </h3>
          <p className="mt-1.5 text-xs text-white/80 sm:text-sm sm:leading-relaxed">
            Curate your personalised LEVA ritual and unlock automatic savings.
          </p>
        </motion.div>

        {/* Tier Cards */}
        <motion.div variants={itemVariants} className="mt-1 space-y-2">
          {/* Tier 1: Choose 2 -> Save 10% */}
          <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/10 p-2.5 transition-colors group-hover:bg-white/15 sm:p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                <Check className="size-3" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white sm:text-sm">
                  Choose any 2 products
                </p>
                <p className="text-[10px] text-white/70 sm:text-[11px]">
                  Everyday duo ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-white/20 px-2 py-1 text-xs font-bold text-accent sm:text-sm">
              Save 10%
            </span>
          </div>

          {/* Tier 2: Choose 3 -> Save 20% */}
          <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-white/15 p-2.5 transition-colors group-hover:bg-white/20 sm:p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-primary">
                ★
              </span>
              <div>
                <p className="text-xs font-semibold text-white sm:text-sm">
                  Choose any 3 products
                </p>
                <p className="text-[10px] text-accent sm:text-[11px]">
                  Complete 3-step ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-bold text-primary sm:text-sm">
              Save 20%
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="relative z-10 mt-6 border-t border-white/15 pt-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-white">
          <span className="group-hover:underline group-hover:underline-offset-4">
            Start building
          </span>
          <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
            <ArrowRight className="size-4 text-white" />
          </span>
        </div>
      </div>
    </Link>
  );
}
