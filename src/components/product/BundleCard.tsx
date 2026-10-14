import Link from "next/link";
import { useStoreData } from "@/store/catalog";
import { ShoppingBag } from "lucide-react";
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
  return (
    <article className="border-t border-primary/25 pt-6">
      <div className="relative flex aspect-[5/4] items-end justify-center overflow-hidden rounded-md bg-background">
        {bundle.image ? (
          <img
            src={bundle.image}
            alt={bundle.name + " with its included LEVA products"}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          included.map((product, index) => (
            <img
              key={product.slug}
              src={product.image}
              alt={`${product.name} included in ${bundle.name}`}
              loading="lazy"
              className={`absolute bottom-0 h-[82%] w-[46%] rounded-t-md object-cover shadow-lg ${index === 0 ? "-translate-x-[42%] -rotate-3" : index === 2 ? "translate-x-[42%] rotate-3" : "z-10"}`}
            />
          ))
        )}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          <Badge variant="saving">
            Save {formatPKR(original - bundle.price)} ({bundle.savePercent}%)
          </Badge>
          {featured && <Badge>Best Value</Badge>}
        </div>
      </div>
      <h3 className="mt-6 text-3xl font-light"><Link href={`/bundles/${bundle.slug}`} className="hover:underline">{bundle.name}</Link></h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.description}</p>
      <ul className="mt-4 space-y-1 text-base text-muted-foreground">
        {included.map((product) => (
          <li key={product.slug}>{product.name}</li>
        ))}
      </ul>
      <div className="my-5 flex items-center gap-4">
        <span className="text-sm line-through text-muted-foreground">{formatPKR(original)}</span>
        <strong className="text-xl font-medium">{formatPKR(bundle.price)}</strong>
      </div>
      <Link href={`/bundles/${bundle.slug}`} className="mb-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4">View bundle details</Link>
      <Button className="w-full" disabled={!bundle.id} onClick={() => addBundle(bundle.slug)}>
        <ShoppingBag /> Add bundle to cart
      </Button>
    </article>
  );
}
