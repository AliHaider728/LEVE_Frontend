"use client";
import { createFileRoute } from "@/lib/router-compat";
import { Hero } from "@/components/home/Hero";
import { ProductStage } from "@/components/home/ProductStage";
import { Manifesto } from "@/components/home/day/Manifesto";
import { RitualSteps } from "@/components/home/day/RitualSteps";
import { Ingredients } from "@/components/home/day/Ingredients";
import { FeaturedRise } from "@/components/home/day/FeaturedRise";
import { BundleStack } from "@/components/home/day/BundleStack";
import { WhyLeva } from "@/components/home/day/WhyLeva";
import { ReviewsDrift } from "@/components/home/day/ReviewsDrift";
import { FaqFinal } from "@/components/home/day/FaqFinal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LEVA — Skincare for Her" },
      {
        name: "description",
        content:
          "LEVA is a considered skincare ritual for her. Discover three essentials made for skin and self.",
      },
      { property: "og:title", content: "LEVA — Skincare for Her" },
      { property: "og:description", content: "Three essentials. One considered skincare ritual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ProductStage />
      <RitualSteps />
      <Ingredients />
      <FeaturedRise />
      <BundleStack />
      <WhyLeva />
      <ReviewsDrift />
      <FaqFinal />
    </main>
  );
}
