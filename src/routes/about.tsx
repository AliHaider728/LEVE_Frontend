"use client";
import { createFileRoute, Link } from "@/lib/router-compat";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { editorialImages } from "@/lib/assets";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LEVA — Care at Her Pace" },
      {
        name: "description",
        content: "Discover the story, philosophy, and values behind LEVA Pakistan.",
      },
      { property: "og:title", content: "About LEVA — Care at Her Pace" },
      {
        property: "og:description",
        content: "The philosophy behind LEVA's three skincare rituals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});
function About() {
  const values = [
    ["01", "Considered", "Every detail has a reason to exist."],
    ["02", "Sensory", "Care should feel as beautiful as it looks."],
    ["03", "Essential", "Three purposeful steps. Nothing unnecessary."],
  ];
  return (
    <main>
      <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-primary p-6 text-primary-foreground md:p-10">
        <motion.img
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          whileInView={{ clipPath: "inset(0% 0 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          src={editorialImages.portrait}
          alt="Woman in a quiet skincare moment"
          className="absolute inset-0 h-full w-full object-cover md:left-auto md:w-[55%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/10 md:bg-gradient-to-r" />
        <div className="relative z-10">
          <p className="eyebrow mb-8">LEVA / Our philosophy</p>
          <h1 className="max-w-4xl text-6xl font-light leading-tight md:text-9xl">
            Less noise.
            <br />
            More feeling.
          </h1>
        </div>
      </section>
      <section className="grid gap-12 px-6 py-28 md:grid-cols-2 md:px-[10vw] md:py-40">
        <p className="eyebrow">The story</p>
        <div>
          <h2 className="text-5xl font-light leading-tight md:text-7xl">
            Skincare that makes room for you.
          </h2>
          <p className="mt-10 max-w-md text-base leading-8">
            LEVA begins with three essentials and one simple belief: the most meaningful ritual is
            the one you want to return to. An invitation to slow down, to notice, and to care.
          </p>
          <p className="mt-6 max-w-md text-base leading-8">
            Created for her pace, each ritual strips away the noise around beauty and returns
            attention to a simple, tactile moment of self-respect.
          </p>
        </div>
      </section>
      <section className="grid min-h-[80vh] md:grid-cols-2">
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="min-h-[60vh] overflow-hidden"
        >
          <img
            src={editorialImages.skin}
            alt="Close detail of luminous skin"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="flex flex-col justify-center bg-accent px-6 py-20 text-foreground md:px-[8vw]">
          <p className="eyebrow mb-8">Our philosophy</p>
          <h2 className="text-5xl font-light md:text-7xl">Care is not correction.</h2>
          <p className="mt-8 max-w-md text-base leading-8">
            It is attention. A quiet conversation with the skin you live in, without disguise or
            excess.
          </p>
        </div>
      </section>
      <section className="px-6 py-28 md:px-[8vw] md:py-40">
        <p className="eyebrow mb-8">What guides us</p>
        <h2 className="max-w-4xl text-5xl font-light md:text-7xl">
          Values felt in every movement.
        </h2>
        <div className="mt-16 grid md:grid-cols-3">
          {values.map(([number, title, copy]) => (
            <div key={number} className="border-t border-primary/20 py-8 md:px-8 md:first:pl-0">
              <span className="text-xs font-medium">{number}</span>
              <h3 className="mt-8 text-3xl font-light">{title}</h3>
              <p className="mt-5 max-w-xs text-base leading-7 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <Button asChild className="mt-16">
          <Link to="/shop">
            Shop the three <ArrowRight />
          </Link>
        </Button>
      </section>
    </main>
  );
}
