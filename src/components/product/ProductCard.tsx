import { Minus, Plus, ShoppingBag, Star, Zap } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import type { Product } from "@/data/products";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const quantity = useCart((state) => state.items[product.slug] ?? 0);
  const add = useCart((state) => state.add);
  const decrement = useCart((state) => state.decrement);
  const buyNow = useCart((state) => state.buyNow);
  const navigate = useNavigate();
  const soldOut = product.badge === "Sold Out" || product.stock === 0;
  const isLimited = product.badge === "Limited Stock" && product.stock > 0 && product.stock <= 10;
  const badgeLabel = isLimited ? `Only ${product.stock} left` : product.badge;
  const discount =
    product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

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
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.hoverImage !== product.image && (
            <img
              src={product.hoverImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent" />
        </Link>

        {/* Top-left Badges overlay (status badge + discount badge cleanly stacked) */}
        <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-3.5rem)] flex-col items-start gap-1 sm:left-3 sm:top-3">
          {product.badge && (
            <Badge
              variant={soldOut ? "sold" : isLimited ? "stock" : "default"}
              className="text-[10px] sm:text-xs"
            >
              {badgeLabel}
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="saving" className="text-[10px] sm:text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button on top-right */}
        <WishlistButton
          slug={product.slug}
          name={product.name}
          className="absolute right-1 top-1 z-20 size-8 sm:right-3 sm:top-3 sm:size-9"
        />

        {/* Desktop-only hover overlay action */}
        <div className="product-card-purchase absolute inset-x-2 bottom-2 z-20 hidden md:block">
          {quantity > 0 ? (
            <div className="flex min-h-11 items-center justify-between gap-1 bg-background px-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                magnetic={false}
                aria-label={`Remove one ${product.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  decrement(product.slug);
                }}
              >
                <Minus />
              </Button>
              <span className="text-xs font-medium">{quantity} in cart</span>
              <Button
                variant="ghost"
                size="icon"
                magnetic={false}
                aria-label={`Add one ${product.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  add(product.slug);
                }}
              >
                <Plus />
              </Button>
            </div>
          ) : (
            <Button
              magnetic={false}
              className="min-h-11 w-full px-2 text-xs sm:text-sm"
              disabled={soldOut}
              onClick={(e) => {
                e.preventDefault();
                add(product.slug);
              }}
            >
              <ShoppingBag />
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className={`${featured ? "mt-2.5" : "mt-3"} block focus-visible:outline-2 focus-visible:outline-offset-4`}
      >
        <h3 className="line-clamp-1 text-base font-light leading-snug sm:text-lg md:text-xl">
          {product.name}
        </h3>
        <p
          className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground sm:text-sm"
        >
          {product.benefit}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
          {product.rating > 0 && product.reviewCount > 0 ? (
            <>
              <Star className="size-3.5 fill-accent text-accent sm:size-4" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount})</span>
            </>
          ) : (
            <span className="text-muted-foreground">No reviews yet</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <strong className="text-sm font-semibold text-foreground sm:text-base">
            {formatPKR(product.price)}
          </strong>
          {product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
      </Link>

      {/* Mobile Actions: Icon-only touch-friendly buttons directly below details (44px tall, min tap target) */}
      <div className="mt-2.5 md:hidden">
        {quantity > 0 ? (
          <div className="flex h-11 items-center justify-between gap-1 rounded-sm border border-input bg-background px-2">
            <Button
              variant="ghost"
              size="icon"
              magnetic={false}
              aria-label={`Remove one ${product.name}`}
              className="size-8"
              onClick={(e) => {
                e.preventDefault();
                decrement(product.slug);
              }}
            >
              <Minus className="size-4" />
            </Button>
            <span className="text-xs font-medium">{quantity} in cart</span>
            <Button
              variant="ghost"
              size="icon"
              magnetic={false}
              aria-label={`Add one ${product.name}`}
              className="size-8"
              onClick={(e) => {
                e.preventDefault();
                add(product.slug);
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              magnetic={false}
              disabled={soldOut}
              className="h-11 w-full"
              aria-label={`Add ${product.name} to cart`}
              title="Add to cart"
              onClick={(e) => {
                e.preventDefault();
                add(product.slug);
              }}
            >
              <ShoppingBag className="size-4" />
            </Button>
            <Button
              variant="outline"
              magnetic={false}
              disabled={soldOut}
              className="h-11 w-full"
              aria-label={`Buy ${product.name} now`}
              title="Buy now"
              onClick={(e) => {
                e.preventDefault();
                buyNow(product.slug);
                void navigate({ to: "/checkout" });
              }}
            >
              <Zap className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Action: Buy now button at bottom (Add to cart appears on hover above) */}
      <div className="mt-auto hidden pt-4 md:block">
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
