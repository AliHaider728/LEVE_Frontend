import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import type { Product } from "@/data/products";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const quantity = useCart((state) => state.items[product.slug] ?? 0);
  const add = useCart((state) => state.add);
  const decrement = useCart((state) => state.decrement);
  const buyNow = useCart((state) => state.buyNow);
  const navigate = useNavigate();
  const soldOut = product.badge === "Sold Out" || product.stock === 0;
  const discount = product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  return (
    <article className="product-card group flex h-full min-w-0 flex-col">
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
          className="absolute left-2 top-2 z-20 max-w-[calc(100%-3.5rem)] text-[10px] sm:left-3 sm:top-3 sm:text-xs"
        >
          {product.badge === "Limited Stock" ? `Only ${product.stock} left` : product.badge}
        </Badge>
        <WishlistButton slug={product.slug} name={product.name} className="absolute right-1 top-1 z-20 size-9 sm:right-3 sm:top-3"/>
        <div className="product-card-purchase absolute inset-x-2 bottom-2 z-20">
          {quantity > 0 ? (
            <div className="flex min-h-11 items-center justify-between gap-1 bg-background px-1">
              <Button
                variant="ghost"
                size="icon"
                magnetic={false}
                aria-label={`Remove one ${product.name}`}
                onClick={() => decrement(product.slug)}
              >
                <Minus />
              </Button>
              <span className="text-xs font-medium">{quantity}</span>
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
            <Button magnetic={false} className="min-h-11 w-full px-2 text-xs sm:text-sm" disabled={soldOut} onClick={() => add(product.slug)}>
              <ShoppingBag />
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className={`${featured ? "mt-3 flex-1" : "mt-5 flex-1"} block focus-visible:outline-2 focus-visible:outline-offset-4`}
      >
        <h3 className="text-lg font-light leading-snug sm:text-xl">{product.name}</h3>
        <p className={`${featured ? "mt-1" : "mt-2"} text-sm leading-6 text-muted-foreground`}>{product.benefit}</p>
        <div className={`${featured ? "mt-2" : "mt-3"} flex flex-wrap items-center gap-1 text-sm`}>
          <Star className="size-4 fill-accent text-accent" />
          <span>{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className={`${featured ? "mt-2" : "mt-3"} flex flex-wrap items-center gap-3`}>
          <strong className="font-medium">{formatPKR(product.price)}</strong>
          <span className="text-sm text-muted-foreground line-through">
            {formatPKR(product.compareAtPrice)}
          </span>
          {discount > 0 && <Badge variant="saving">-{discount}%</Badge>}
        </div>
      </Link>
      <div className="mt-auto pt-4">
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
