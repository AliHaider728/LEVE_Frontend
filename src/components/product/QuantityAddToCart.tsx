import { useStoreData } from "@/store/catalog";
import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { MessageCircle, Minus, Plus, ShoppingBag, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

import { formatPKR } from "@/config/store";
import { whatsappLink } from "@/lib/whatsapp";

export function QuantityAddToCart({ slug }: { slug: string }) {
  const { products } = useStoreData();
  const [quantity, setQuantity] = useState(1);
  const addMany = useCart((s) => s.addMany);
  const buyNow = useCart((s) => s.buyNow);
  const navigate = useNavigate();
  const product = products.find(p => p.slug === slug);
  const buy = () => {
    buyNow(slug, quantity);
    void navigate({ to: "/checkout" });
  };
  const waMsg = product
    ? `Hi LEVA, I want to order ${product.name} x ${quantity} (${formatPKR(product.price * quantity)}).\nLEVA_URL`
    : "";
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <div
          className="flex h-12 items-center border border-primary"
          aria-label="Quantity selector"
        >
          <Button
            variant="ghost"
            size="icon"
            magnetic={false}
            aria-label="Decrease quantity"
            disabled={quantity === 1}
            onClick={() => setQuantity((v) => Math.max(1, v - 1))}
          >
            <Minus />
          </Button>
          <span className="w-9 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            magnetic={false}
            aria-label="Increase quantity"
            onClick={() => setQuantity((v) => v + 1)}
          >
            <Plus />
          </Button>
        </div>
        <Button size="lg" className="h-12 px-5" onClick={() => addMany(slug, quantity)}>
          <ShoppingBag /> Add to cart
        </Button>
        <Button size="lg" variant="outline" className="h-12 px-5" onClick={buy}>
          <Zap /> Buy now
        </Button>
      </div>
      {product && (
        <p className="mt-3 flex items-center gap-1 text-sm">
          <Star className="size-4 fill-accent text-accent" />
          {product.rating} · {product.reviewCount} reviews
        </p>
      )}
      {product && (
        <Button
          variant="link"
          magnetic={false}
          className="mt-1 px-0"
          onClick={() =>
            window.open(
              whatsappLink(waMsg.replace("LEVA_URL", window.location.href)),
              "_blank",
              "noopener",
            )
          }
        >
          <MessageCircle /> Order on WhatsApp
        </Button>
      )}
      {product && (
        <div data-product-purchase className="fixed inset-x-0 bottom-[calc(4rem+2px+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 border-t border-primary/20 bg-background/95 px-3 py-2 backdrop-blur md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs">{product.name}</p>
            <p className="text-sm font-medium">{formatPKR(product.price * quantity)}</p>
          </div>
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => addMany(slug, quantity)}
            magnetic={false}
          >
            Add to cart
          </Button>
          <Button size="sm" variant="outline" className="min-h-11" onClick={buy} magnetic={false}>
            Buy now
          </Button>
        </div>
      )}
    </div>
  );
}
