import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import type { Product } from "@/data/products";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const quantity = useCart((state) => state.items[product.slug] ?? 0);
  const add = useCart((state) => state.add);
  const decrement = useCart((state) => state.decrement);
  const buyNow = useCart((state) => state.buyNow);
  const navigate = useNavigate();
  const soldOut = product.badge === "Sold Out" || product.stock === 0;
  const discount = Math.round((1 - product.price / product.compareAtPrice) * 100);
  return (
    <article className={featured ? "group flex h-full min-w-0 flex-col" : "group min-w-0"}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
        <Link
          to="/shop/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-10"
        >
          <img
            src={product.image}
            alt={`${product.name} unbranded skincare editorial`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <img
            src={product.hoverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent" />
        </Link>
        <Badge
          variant={soldOut ? "sold" : product.badge === "Limited Stock" ? "stock" : "default"}
          className="absolute left-3 top-3 z-20"
        >
          {product.badge === "Limited Stock" ? `Only ${product.stock} left` : product.badge}
        </Badge>
        <Button
          variant="secondary"
          size="icon"
          magnetic={false}
          aria-label={`Save ${product.name} to wishlist`}
          className="absolute right-3 top-3 z-20 min-h-11 min-w-11 rounded-full"
        >
          <Heart />
        </Button>
        <div className="absolute inset-x-3 bottom-3 z-20 translate-y-0 transition-transform md:translate-y-20 md:group-hover:translate-y-0">
          {quantity > 0 ? (
            <div className="flex h-12 items-center justify-between bg-background px-2">
              <Button
                variant="ghost"
                size="icon"
                magnetic={false}
                aria-label={`Remove one ${product.name}`}
                onClick={() => decrement(product.slug)}
              >
                <Minus />
              </Button>
              <span className="text-sm font-medium">{quantity} in cart</span>
              <Button
                variant="ghost"
                size="icon"
                magnetic={false}
                aria-label={`Add one ${product.name}`}
                onClick={() => add(product.slug)}
              >
                <Plus />
              </Button>
            </div>
          ) : (
            <Button className="h-12 w-full" disabled={soldOut} onClick={() => add(product.slug)}>
              <ShoppingBag />
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className={`${featured ? "mt-3 flex-1" : "mt-5"} block focus-visible:outline-2 focus-visible:outline-offset-4`}
      >
        <h3 className={featured ? "text-xl font-light" : "text-2xl font-light"}>{product.name}</h3>
        <p className={`${featured ? "mt-1" : "mt-2"} line-clamp-1 text-base text-muted-foreground`}>{product.benefit}</p>
        <div className={`${featured ? "mt-2" : "mt-3"} flex items-center gap-1 text-sm`}>
          <Star className="size-4 fill-accent text-accent" />
          <span>{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className={`${featured ? "mt-2" : "mt-3"} flex flex-wrap items-center gap-3`}>
          <strong className="font-medium">{formatPKR(product.price)}</strong>
          <span className="text-sm text-muted-foreground line-through">
            {formatPKR(product.compareAtPrice)}
          </span>
          <Badge variant="saving">-{discount}%</Badge>
        </div>
      </Link>
      <div className={featured ? "mt-auto pt-3" : "mt-4"}>
        <Button
          variant="outline"
          magnetic={false}
          disabled={soldOut}
          className="h-11 w-full"
          onClick={() => {
            buyNow(product.slug);
            void navigate({ to: "/checkout" });
          }}
        >
          Buy now
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/5] rounded-md bg-secondary" />
      <div className="mt-5 h-6 w-2/3 bg-secondary" />
      <div className="mt-3 h-4 w-full bg-secondary" />
      <div className="mt-4 h-5 w-1/2 bg-secondary" />
    </div>
  );
}
