import { useRef } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { motion, useInView, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Eye, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { getPriceDisplay, getStockDisplay } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { WhatsAppContact } from '@/components/product/WhatsAppContact';
import { CountUp } from "./CountUp";

export function useProductActions(product: Product) {
  const quantity = useCart((s) => s.items[product.slug] ?? 0);
  const add = useCart((s) => s.add);
  const decrement = useCart((s) => s.decrement);
  const buyNow = useCart((s) => s.buyNow);
  const navigate = useNavigate();
  const soldOut = !getStockDisplay(product).inStock;
  return {
    quantity,
    soldOut,
    add: () => add(product.slug),
    decrement: () => decrement(product.slug),
    buy: () => {
      buyNow(product.slug);
      void navigate({ to: "/checkout" });
    },
  };
}

function Actions({ product, onQuickView }: { product: Product; onQuickView: () => void }) {
  const a = useProductActions(product);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {a.quantity > 0 ? (
        <div className="flex h-12 items-center border border-primary px-1">
          <Button
            variant="ghost"
            size="icon"
            magnetic={false}
            aria-label={`Remove one ${product.name}`}
            onClick={a.decrement}
          >
            <Minus />
          </Button>
          <span className="w-16 text-center text-sm">{a.quantity} in cart</span>
          <Button
            variant="ghost"
            size="icon"
            magnetic={false}
            aria-label={`Add one ${product.name}`}
            onClick={a.add}
          >
            <Plus />
          </Button>
        </div>
      ) : (
        <Button className="h-12" disabled={a.soldOut} onClick={a.add}>
          <ShoppingBag /> Add to cart
        </Button>
      )}
      <Button variant="outline" className="h-12" disabled={a.soldOut} onClick={a.buy}>
        Buy now
      </Button>
      <WhatsAppContact product={product} compact/>
      <Button variant="link" magnetic={false} onClick={onQuickView}>
        <Eye /> Quick view
      </Button>
    </div>
  );
}

function Media({
  product,
  shape,
  priority,
}: {
  product: Product;
  shape: "curtain" | "arch" | "tall";
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-6%", "6%"]);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -40px 0px" });
  const clip = shape === "arch" ? "rounded-t-[999px] rounded-b-2xl" : "rounded-2xl";
  const hidden =
    shape === "curtain"
      ? "inset(0% 100% 0% 0%)"
      : shape === "arch"
        ? "inset(100% 0% 0% 0%)"
        : "inset(50% 0% 50% 0%)";
  const pricing = getPriceDisplay(product);
  return (
    <div ref={ref}>
      <div
        style={{
          clipPath: reduced || inView ? "inset(0% 0% 0% 0%)" : hidden,
          transition: "clip-path 1.1s cubic-bezier(.22,1,.36,1)",
        }}
        className={`group relative aspect-[4/5] overflow-hidden bg-secondary ${clip}`}
      >
        <Link
          to="/shop/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
          className="absolute inset-0"
        >
          <motion.img
            style={{ y, scale: 1.14 }}
            src={product.image}
            alt={`${product.name} by LEVA`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
          {product.hoverImage !== product.image && <img
            src={product.hoverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />}
        </Link>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {getStockDisplay(product).badge && <Badge variant={getStockDisplay(product).badge!.variant}>{getStockDisplay(product).badge!.text}</Badge>}
          {pricing.hasDiscount && <Badge variant="saving">{pricing.saveBadgeText}</Badge>}
        </div>
        <WishlistButton slug={product.slug} name={product.name} className="absolute right-4 top-4 size-11 bg-background/90 text-primary"/>

      </div>
    </div>
  );
}

function Details({
  product,
  index,
  onQuickView,
}: {
  product: Product;
  index: number;
  onQuickView: () => void;
}) {
  const pricing = getPriceDisplay(product);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="relative min-w-0"
    >
      <p className="eyebrow">
        {String(index + 1).padStart(2, "0")} · {product.type}
      </p>
      <h2 className="mt-3 text-3xl font-light leading-tight text-foreground md:text-[2.75rem]">
        {product.name}
      </h2>
      <p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
        {product.benefit} {product.description}
      </p>
      {product.rating > 0 && product.reviewCount > 0 && (
        <p className="mt-4 flex items-center gap-1 text-sm">
          <Star className="size-4 fill-accent text-accent" /> {product.rating} ·{" "}
          <CountUp value={product.reviewCount} /> reviews
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <strong className="text-2xl font-medium">
          {pricing.formattedPrice}
        </strong>
        {pricing.hasDiscount && <><span className="text-sm text-muted-foreground line-through">{pricing.formattedCompareAtPrice}</span><Badge variant="saving">{pricing.saveBadgeText}</Badge></>}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        For: {product.concerns.join(", ")} · {product.skinTypes.join(", ")} skin
      </p>
      <Actions product={product} onQuickView={onQuickView} />
    </motion.div>
  );
}

export function StoryRow({
  product,
  index,
  highlighted,
  onQuickView,
}: {
  product: Product;
  index: number;
  highlighted?: boolean;
  onQuickView: () => void;
}) {
  const variant = index % 3;
  const ring = highlighted
    ? "ring-2 ring-accent ring-offset-8 ring-offset-background rounded-3xl"
    : "";
  if (variant === 0)
    return (
      <div
        id={`row-${product.slug}`}
        className={`grid scroll-mt-40 items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-16 ${ring}`}
      >
        <Media product={product} shape="curtain" priority={index === 0} />
        <Details product={product} index={index} onQuickView={onQuickView} />
      </div>
    );
  if (variant === 1)
    return (
      <div
        id={`row-${product.slug}`}
        className={`relative grid scroll-mt-40 items-center gap-8 md:grid-cols-[1fr_0.9fr] md:gap-16 ${ring}`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 left-0 select-none text-[9rem] font-light leading-none text-primary/[0.07] md:text-[16rem]"
        >
          {product.number}
        </span>
        <div className="relative order-2 md:order-1">
          <Details product={product} index={index} onQuickView={onQuickView} />
        </div>
        <div className="order-1 md:order-2 md:px-8">
          <Media product={product} shape="arch" />
        </div>
      </div>
    );
  return (
    <div id={`row-${product.slug}`} className={`relative scroll-mt-40 ${ring}`}>
      <div className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,420px)_auto] md:justify-center md:gap-10">
        <p
          aria-hidden
          className="hidden text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground [writing-mode:vertical-rl] rotate-180 md:block"
        >
          {product.ritual}
        </p>
        <Media product={product} shape="tall" />
        <p
          aria-hidden
          className="hidden text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground [writing-mode:vertical-rl] md:block"
        >
          {product.size} · LEVA {product.number}
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-xl md:text-center [&_.flex]:md:justify-center">
        <Details product={product} index={index} onQuickView={onQuickView} />
      </div>
    </div>
  );
}
