import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { bundles } from "@/data/bundles";
import { BundleCard } from "@/components/product/BundleCard";
import { Button } from "@/components/ui/button";

export function BundleSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="bg-secondary px-6 py-24 md:px-[8vw] md:py-36">
      <div className="mb-14 grid gap-6 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-5">Rituals together</p>
          <h2 className="text-5xl font-light md:text-7xl">Save with a complete ritual.</h2>
        </div>
        <Button asChild variant="link">
          <Link to="/bundles">
            View all <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className={`grid gap-12 ${compact ? "md:grid-cols-2" : "md:grid-cols-[1.1fr_.9fr]"}`}>
        {bundles.map((bundle, index) => (
          <div key={bundle.slug} className={index === 1 ? "md:mt-20" : ""}>
            <BundleCard bundle={bundle} featured={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
