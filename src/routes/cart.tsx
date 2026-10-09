"use client";
import { CustomBundleLine } from "@/components/product/CustomBundleLine";
import { createFileRoute, Link } from "@/lib/router-compat";
import { Minus, Plus, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { bundles, getBundleOriginalPrice } from "@/data/bundles";
import { formatPKR, getFreeShippingRemaining, storeConfig } from "@/config/store";
import { getCartTotals } from "@/lib/cart-totals";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — LEVA Pakistan" },
      { name: "description", content: "Review your LEVA skincare order in PKR." },
      { property: "og:title", content: "Your Cart — LEVA" },
      { property: "og:description", content: "Review your LEVA skincare order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const cart = useCart();
  const lines = products.filter((product) => cart.items[product.slug]);
  const bundleLines = bundles.filter((bundle) => cart.bundles[bundle.slug]);
  const totals = getCartTotals(cart.items, cart.bundles, cart.coupon, cart.custom);
  const remaining = getFreeShippingRemaining(totals.subtotal);
  const empty = !lines.length && !bundleLines.length && !totals.customCount;
  return (
    <main className="min-h-[80vh] px-6 pb-24 pt-32 md:px-[10vw] md:pt-40">
      <p className="eyebrow mb-6">LEVA / Your selection</p>
      <h1 className="text-6xl font-light md:text-8xl">Your cart.</h1>
      {empty ? (
        <div className="mt-16">
          <p className="text-2xl font-light">Your cart is quietly waiting.</p>
          <Button asChild className="mt-8">
            <Link to="/shop">Explore the three</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_360px]">
          <div>
            {lines.map((product) => (
              <CartLine
                key={product.slug}
                name={product.name}
                price={product.price}
                quantity={cart.items[product.slug] ?? 0}
                image={product.image}
                onMinus={() => cart.decrement(product.slug)}
                onPlus={() => cart.add(product.slug)}
                onRemove={() => cart.remove(product.slug)}
              />
            ))}
            <CustomBundleLine />
            {bundleLines.map((bundle) => (
              <div key={bundle.slug}>
                <CartLine
                  name={bundle.name}
                  price={bundle.price}
                  quantity={cart.bundles[bundle.slug] ?? 0}
                  onMinus={() => cart.decrementBundle(bundle.slug)}
                  onPlus={() => cart.addBundle(bundle.slug)}
                  onRemove={() => cart.removeBundle(bundle.slug)}
                />
                <p className="-mt-5 mb-6 ml-24 text-sm">
                  Bundle discount: -
                  {formatPKR(
                    (getBundleOriginalPrice(bundle) - bundle.price) *
                      (cart.bundles[bundle.slug] ?? 0),
                  )}
                </p>
              </div>
            ))}
          </div>
          <aside className="border-t border-primary/20 pt-6">
            <p className="eyebrow mb-6">Summary</p>
            <p className="text-sm">
              {remaining > 0
                ? `Add ${formatPKR(remaining)} more for free delivery`
                : "You unlocked free delivery"}
            </p>
            <Progress
              className="mt-3"
              value={Math.min(100, (totals.subtotal / storeConfig.freeShippingThreshold) * 100)}
            />
            <Summary totals={totals} />
            <Button asChild className="mt-6 w-full">
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}

function CartLine({
  name,
  price,
  quantity,
  image,
  onMinus,
  onPlus,
  onRemove,
}: {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onMinus: () => void;
  onPlus: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-4 border-t border-primary/20 py-6">
      {image ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="aspect-[4/5] h-24 w-20 rounded-sm object-cover"
        />
      ) : (
        <div className="grid h-24 w-20 place-items-center rounded-sm bg-accent text-xl">
          ×{quantity}
        </div>
      )}
      <div>
        <p className="text-xl font-light">{name}</p>
        <p className="mt-2 text-sm text-muted-foreground">{formatPKR(price)}</p>
        <div className="mt-3 flex items-center">
          <Button
            variant="outline"
            size="icon"
            magnetic={false}
            onClick={onMinus}
            aria-label={`Remove one ${name}`}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            magnetic={false}
            onClick={onPlus}
            aria-label={`Add one ${name}`}
          >
            <Plus />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <strong className="font-medium">{formatPKR(price * quantity)}</strong>
        <Button
          variant="ghost"
          size="icon"
          magnetic={false}
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function Summary({ totals }: { totals: ReturnType<typeof getCartTotals> }) {
  return (
    <div className="mt-6 space-y-3 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPKR(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-accent-foreground">
          <span>Bundle discount</span>
          <span>-{formatPKR(totals.discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>{totals.shipping === 0 ? "Free" : formatPKR(totals.shipping)}</span>
      </div>
      <div className="flex justify-between border-t border-primary/20 pt-4 text-xl font-medium">
        <span>Total</span>
        <span>{formatPKR(totals.total)}</span>
      </div>
    </div>
  );
}
