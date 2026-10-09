import { cn } from "@/lib/utils";
import { products } from "@/data/products";

export function ProductVessel({ number, className }: { number: string; className?: string }) {
  const product = products.find((item) => item.number === number);
  if (!product) return null;
  return (
    <div
      className={cn(
        "product-vessel relative aspect-[3/5] overflow-hidden rounded-lg bg-secondary",
        className,
      )}
    >
      <img
        src={product.image}
        alt={`${product.name} — LEVA skincare`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
