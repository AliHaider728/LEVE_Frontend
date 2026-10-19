import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { products, type Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { formatPKR } from "@/config/store";
import { ArrowRight, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";

const steps = [
  { q: "What is your skin type?", options: ["Dry", "Oily", "Combination", "Normal"] },
  { q: "What worries you most?", options: ["Dullness", "Dryness", "Uneven tone", "Sensitivity"] },
  { q: "Is your skin sensitive?", options: ["Yes", "A little", "No"] },
];

function recommend(a: string[]): Product {
  const [type, concern, sensitive] = a;
  if (sensitive === "Yes" || concern === "Sensitivity")
    return products.find((p) => p.type === "Cleanser") ?? products[0]!;
  if (concern === "Uneven tone" || concern === "Dullness")
    return products.find((p) => p.type === "Cream") ?? products[1]!;
  if (type === "Dry" || concern === "Dryness")
    return products.find((p) => p.type === "Cream") ?? products[0]!;
  return products.find((p) => p.type === "Sunscreen") ?? products[2]!;
}

export function SkinQuiz({ onHighlight }: { onHighlight: (slug: string | null) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const add = useCart((s) => s.add);
  const done = answers.length === steps.length;
  const resultProduct = done ? recommend(answers) : null;

  const pick = (o: string) => {
    const next = [...answers, o];
    setAnswers(next);
    if (next.length === steps.length) {
      const r = recommend(next);
      onHighlight(r.slug);
    }
  };

  const step = steps[answers.length];

  return (
    <section
      aria-label="Skin quiz"
      className="mx-5 my-16 rounded-3xl bg-secondary p-6 md:mx-[6vw] md:p-12"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Skin quiz · {Math.min(answers.length + 1, 3)} of 3</p>
        {answers.length > 0 && !done && (
          <button
            type="button"
            onClick={() => setAnswers([])}
            className="text-xs text-muted-foreground hover:text-primary underline"
          >
            Reset
          </button>
        )}
      </div>
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
              <legend className="text-[15px] font-medium text-foreground">{step.q}</legend>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {step.options.map((o) => (
                  <Button
                    key={o}
                    variant="outline"
                    magnetic={false}
                    className="min-h-12 rounded-full border-primary/20 bg-white px-6 text-sm font-medium hover:border-primary hover:bg-primary hover:text-white"
                    onClick={() => pick(o)}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}

          {resultProduct && (
            <div className="mt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-3 text-accent" /> Recommended for your skin
              </div>
              <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                <Link
                  to="/shop/$slug"
                  params={{ slug: resultProduct.slug }}
                  className="relative aspect-square w-full max-w-[140px] shrink-0 overflow-hidden rounded-xl bg-[#FFF4F6] mx-auto sm:mx-0"
                >
                  <img
                    src={resultProduct.image}
                    alt={resultProduct.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                  />
                </Link>
                <div className="flex-1 text-left">
                  <p className="eyebrow text-muted-foreground">{resultProduct.type}</p>
                  <h3 className="mt-1 text-2xl font-light text-foreground">
                    <Link
                      to="/shop/$slug"
                      params={{ slug: resultProduct.slug }}
                      className="hover:underline"
                    >
                      {resultProduct.name}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {resultProduct.benefit}
                  </p>
                  <p className="mt-3 text-xl font-medium text-foreground">
                    {formatPKR(resultProduct.price)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      className="h-11 px-6 text-sm"
                      onClick={() => add(resultProduct.slug)}
                    >
                      <ShoppingBag className="mr-1.5 size-4" /> Add to cart
                    </Button>
                    <Button asChild variant="outline" className="h-11 border-primary/20 text-sm">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: resultProduct.slug }}
                      >
                        View product details <ArrowRight className="ml-1.5 size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setAnswers([]);
                        onHighlight(null);
                      }}
                    >
                      <RotateCcw className="mr-1 size-3.5" /> Retake quiz
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
