import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useStoreData } from "@/store/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { BuildBundleCard } from "@/components/product/BuildBundleCard";
import { CatalogStatus } from "@/components/product/CatalogStatus";
import { Button } from "@/components/ui/button";
export function FeaturedRise() {
  const { products } = useStoreData();
  return <section aria-label="Featured products" className="bg-background px-4 py-16 md:px-[8vw]">
    <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
      <div><p className="eyebrow">Featured</p><h2 className="mt-2 text-3xl font-light md:text-[2.75rem]">The essential three.</h2></div>
      <Button asChild variant="link"><Link to="/shop">View all <ArrowRight /></Link></Button>
    </div>
    <CatalogStatus />
    <div className="mt-8 grid auto-rows-fr grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map(product => <div key={product.slug} data-featured-card className="min-w-0"><ProductCard product={product} featured /></div>)}
      <BuildBundleCard />
    </div>
  </section>;
}
