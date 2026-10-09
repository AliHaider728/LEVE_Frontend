import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { products, type Product } from "@/data/products";
import { bundles } from "@/data/bundles";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

const steps = [
  { q: "What is your skin type?", options: ["Dry", "Oily", "Combination", "Normal"] },
  { q: "What worries you most?", options: ["Dullness", "Dryness", "Uneven tone", "Sensitivity"] },
  { q: "Is your skin sensitive?", options: ["Yes", "A little", "No"] },
];

function recommend(a: string[]): Product | "bundle" {
  const [type, concern, sensitive] = a;
  if (sensitive === "Yes" || concern === "Sensitivity")
    return products.find((p) => p.type === "Cleanser") ?? products[0]!;
  if (concern === "Dryness" && type === "Dry") return "bundle";
  if (concern === "Uneven tone") return products.find((p) => p.type === "Cream") ?? products[0]!;
  return products.find((p) => p.type === "Serum") ?? products[0]!;
}

export function SkinQuiz({ onHighlight }: { onHighlight: (slug: string | null) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const add = useCart((s) => s.add);
  const addBundle = useCart((s) => s.addBundle);
  const done = answers.length === steps.length;
  const result = done ? recommend(answers) : null;
  const pick = (o: string) => {
    const next = [...answers, o];
    setAnswers(next);
    if (next.length === steps.length) {
      const r = recommend(next);
      if (r !== "bundle") {
        onHighlight(r.slug);
        document
          .getElementById(`row-${r.slug}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
  const step = steps[answers.length];
  return (
    <section
      aria-label="Skin quiz"
      className="mx-5 my-16 rounded-3xl bg-secondary p-6 md:mx-[6vw] md:p-12"
    >
      <p className="eyebrow">Skin quiz · {Math.min(answers.length + 1, 3)} of 3</p>
      <h2 className="mt-2 text-2xl font-light md:text-3xl">Not sure what suits you?</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={answers.length}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {step && (
            <fieldset>
              <legend className="text-[15px] font-medium">{step.q}</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.options.map((o) => (
                  <Button
                    key={o}
                    variant="outline"
                    magnetic={false}
                    className="min-h-11 rounded-full"
                    onClick={() => pick(o)}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}
          {result && (
            <div>
              <p className="text-[15px]">
                We recommend{" "}
                <strong className="font-medium">
                  {result === "bundle" ? bundles[0]!.name : result.name}
                </strong>
                .
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  className="h-12"
                  onClick={() =>
                    result === "bundle" ? addBundle(bundles[0]!.slug) : add(result.slug)
                  }
                >
                  Add to cart
                </Button>
                <Button
                  variant="link"
                  magnetic={false}
                  onClick={() => {
                    setAnswers([]);
                    onHighlight(null);
                  }}
                >
                  Start again
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
