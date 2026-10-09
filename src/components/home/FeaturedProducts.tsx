import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  return (
    <section className="overflow-hidden px-6 py-28 md:px-[8vw] md:py-40">
      <div className="mb-14 grid gap-6 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-5">Featured products</p>
          <h2 className="max-w-3xl text-5xl font-light leading-tight md:text-7xl">
            Care, in three movements.
          </h2>
        </div>
        <Button asChild variant="link">
          <Link to="/shop">
            View all <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="-mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-5 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
        {products.map((product) => (
          <div key={product.slug} className="w-[82vw] shrink-0 snap-center md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
