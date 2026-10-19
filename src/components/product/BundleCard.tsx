import { Link } from "@/lib/router-compat";
import { useStoreData } from "@/store/catalog";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Bundle } from "@/data/bundles";
import { getBundleOriginalPrice } from "@/data/bundles";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BundleCard({ bundle, featured = false }: { bundle: Bundle; featured?: boolean }) {
  const { products } = useStoreData();
  const addBundle = useCart((state) => state.addBundle);
  const included = bundle.productSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const original = getBundleOriginalPrice(bundle, products);
  const isDuo = bundle.slug === "the-essentials" || bundle.name.toLowerCase().includes("duo") || included.length === 2;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <Link
        to="/bundles/$slug"
        params={{ slug: bundle.slug }}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#FFF4F6] cursor-pointer"
        aria-label={`View ${bundle.name} details`}
      >
        {bundle.image && !isDuo ? (
          <img
            src={bundle.image}
            alt={`${bundle.name} with its included LEVA products`}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-end justify-center pb-2">
            {included.map((product, index) => (
              <img
                key={product.slug}
                src={product.image}
                alt={`${product.name} included in ${bundle.name}`}
                loading="lazy"
                className={`h-[82%] w-[46%] rounded-t-lg object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 ${
                  index === 0 ? "-mr-3 z-10 -rotate-2" : "z-20 rotate-2"
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1.5">
          <Badge variant="saving" className="text-[10px] sm:text-xs">
            Save {bundle.savePercent}%
          </Badge>
          {featured && <Badge className="text-[10px] sm:text-xs">Best Value</Badge>}
        </div>
      </Link>

      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {included.length} Products
          </span>
          <span className="text-xs font-medium text-accent">
            Save {formatPKR(original - bundle.price)}
          </span>
        </div>

        <h3 className="mt-1 text-lg font-light leading-snug sm:text-xl md:text-2xl">
          <Link to="/bundles/$slug" params={{ slug: bundle.slug }} className="hover:underline">
            {bundle.name}
          </Link>
        </h3>

        {bundle.description && (
          <p className="mt-1.5 hidden text-xs leading-5 text-muted-foreground md:block">
            {bundle.description}
          </p>
        )}

        <div className="mt-2.5 flex items-baseline gap-2">
          <strong className="text-base font-semibold text-foreground sm:text-lg">
            {formatPKR(bundle.price)}
          </strong>
          <span className="text-xs text-muted-foreground line-through">
            {formatPKR(original)}
          </span>
        </div>

        <div className="mt-auto pt-3.5">
          <Button
            className="h-11 w-full text-xs font-medium sm:text-sm"
            onClick={() => addBundle(bundle.slug)}
          >
            <ShoppingBag className="mr-1.5 size-4" /> Add bundle to cart
          </Button>
          <div className="mt-2 text-center">
            <Link
              to="/bundles/$slug"
              params={{ slug: bundle.slug }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              View bundle details <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
