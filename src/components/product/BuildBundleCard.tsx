"use client";

import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { motion, useReducedMotion, type Variants } from "motion/react";

export function BuildBundleCard() {
  const reduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.35,
        ease: "easeOut",
        staggerChildren: reduced ? 0 : 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.3, ease: "easeOut" },
    },
  };

  return (
    <Link
      to="/bundles/build"
      className="group relative flex w-full self-start min-w-0 flex-col overflow-hidden rounded-md border border-primary/20 bg-primary p-3 text-primary-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-5"
      aria-label="Build your own bundle — Choose any 2 products to save 10%, or any 3 to save 15%"
    >
      <motion.div
        className="relative z-10 flex flex-col gap-2.5 sm:gap-4 [transform:translateZ(0)] [-webkit-font-smoothing:antialiased]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        variants={containerVariants}
      >
        {/* Top Eyebrow & Sparkle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
            <Sparkles className="size-2.5 text-accent sm:size-3" /> Custom Routine
          </span>
          <span className="text-[10px] font-medium text-white/75 sm:text-[11px] whitespace-nowrap">Up to 15% off</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={itemVariants}>
          <h3 className="font-heading text-base font-light leading-snug sm:text-2xl [transform:translateZ(0)]">
            Build your own bundle
          </h3>
          <p className="mt-1 text-[11px] leading-tight text-white/80 sm:mt-1.5 sm:text-sm sm:leading-relaxed">
            Curate your personalised LEVA ritual and unlock automatic savings.
          </p>
        </motion.div>

        {/* Tier Cards */}
        <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2">
          {/* Tier 1: Choose 2 -> Save 10% */}
          <div className="flex items-center justify-between gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 transition-colors group-hover:bg-white/15 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-white/20 text-[9px] font-bold text-white sm:size-5 sm:text-[10px]">
                <Check className="size-2.5 sm:size-3" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white whitespace-nowrap sm:text-sm">
                  <span className="sm:hidden">Any 2</span>
                  <span className="hidden sm:inline">Choose any 2</span>
                </p>
                <p className="hidden text-[10px] text-white/70 sm:block sm:text-[11px]">
                  Everyday duo ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-accent sm:rounded-md sm:px-2 sm:py-1 sm:text-xs whitespace-nowrap">
              Save 10%
            </span>
          </div>

          {/* Tier 2: Choose 3 -> Save 15% */}
          <div className="flex items-center justify-between gap-1.5 rounded-lg border border-accent/40 bg-white/15 px-2.5 py-1.5 transition-colors group-hover:bg-white/20 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-[9px] font-bold text-primary sm:size-5 sm:text-[10px]">
                ★
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white whitespace-nowrap sm:text-sm">
                  <span className="sm:hidden">Any 3+</span>
                  <span className="hidden sm:inline">Choose 3 or more</span>
                </p>
                <p className="hidden text-[10px] text-accent sm:block sm:text-[11px]">
                  Complete 3-step ritual
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-primary sm:rounded-md sm:px-2 sm:py-1 sm:text-xs whitespace-nowrap">
              Save 15%
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="relative z-10 mt-3 border-t border-white/15 pt-2 sm:mt-4 sm:pt-3">
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
