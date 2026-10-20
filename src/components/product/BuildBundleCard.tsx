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
      className="group relative flex h-full min-h-[340px] min-w-0 flex-col justify-between overflow-hidden rounded-md border border-primary/20 bg-primary p-3.5 text-primary-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 sm:min-h-[400px] sm:p-5"
      aria-label="Build your own bundle — Choose any 2 products to save 10%, or any 3 to save 15%"
    >
      {/* Subtle decorative background gradient */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-125"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 flex flex-col gap-3 sm:gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={containerVariants}
      >
        {/* Top Eyebrow & Sparkle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
            <Sparkles className="size-2.5 text-accent sm:size-3" /> Custom Routine
          </span>
          <span className="text-[10px] font-medium text-white/75 sm:text-[11px]">Up to 15% off</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={itemVariants}>
          <h3 className="font-heading text-lg font-light leading-snug sm:text-2xl">
            Build your own bundle
          </h3>
          <p className="mt-1 text-[11px] leading-tight text-white/80 sm:mt-1.5 sm:text-sm sm:leading-relaxed">
            Curate your personalised LEVA ritual and unlock automatic savings.
          </p>
        </motion.div>

        {/* Tier Cards */}
        <motion.div variants={itemVariants} className="mt-0.5 space-y-1.5 sm:mt-1 sm:space-y-2">
          {/* Tier 1: Choose 2 -> Save 10% */}
          <div className="flex items-center justify-between gap-1.5 rounded-lg border border-white/15 bg-white/10 p-2 transition-colors group-hover:bg-white/15 sm:p-3">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-white/20 text-[9px] font-bold text-white sm:size-5 sm:text-[10px]">
                <Check className="size-2.5 sm:size-3" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-white sm:text-sm">
                  Choose any 2
                </p>
                <p className="hidden text-[10px] text-white/70 sm:block sm:text-[11px]">
                  Everyday duo ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-accent sm:rounded-md sm:px-2 sm:py-1 sm:text-xs">
              Save 10%
            </span>
          </div>

          {/* Tier 2: Choose 3 -> Save 15% */}
          <div className="flex items-center justify-between gap-1.5 rounded-lg border border-accent/40 bg-white/15 p-2 transition-colors group-hover:bg-white/20 sm:p-3">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-[9px] font-bold text-primary sm:size-5 sm:text-[10px]">
                ★
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-white sm:text-sm">
                  Choose 3 or more
                </p>
                <p className="hidden text-[10px] text-accent sm:block sm:text-[11px]">
                  Complete 3-step ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-primary sm:rounded-md sm:px-2 sm:py-1 sm:text-xs">
              Save 20%
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="relative z-10 mt-4 border-t border-white/15 pt-3 sm:mt-6 sm:pt-4">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-white sm:text-xs">
          <span className="group-hover:underline group-hover:underline-offset-4">
            Start building
          </span>
          <span className="grid size-6 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/25 sm:size-7">
            <ArrowRight className="size-3.5 text-white sm:size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
