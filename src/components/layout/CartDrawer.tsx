import { useStoreData } from "@/store/catalog";
import { useState } from "react";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { formatPKR, getFreeShippingRemaining } from "@/config/store";
import { CustomBundleLine } from "@/components/product/CustomBundleLine";
import { getCartTotals, getCouponRate } from "@/lib/cart-totals";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckoutTrust } from "@/components/layout/CheckoutTrust";

export function CartDrawer() {
  const { products, bundles, settings: storeConfig } = useStoreData();
  const {
    custom,
    items,
    bundles: bundleItems,
    open,
    setOpen,
    add,
    decrement,
    remove,
    addBundle,
    decrementBundle,
    removeBundle,
    coupon,
    setCoupon,
  } = useCart();
  const [code, setCode] = useState(coupon);
  const [couponMsg, setCouponMsg] = useState("");
  const lines = products.filter((p) => items[p.slug]);
  const bundleLines = bundles.filter((b) => bundleItems[b.slug]);
  const totals = getCartTotals(items, bundleItems, coupon, custom, useStoreData.getState());
  const remaining = getFreeShippingRemaining(totals.payableSubtotal, storeConfig);
  const empty = lines.length === 0 && bundleLines.length === 0 && totals.customCount === 0;
  const applyCoupon = () => {
    if (getCouponRate(code)) {
      setCoupon(code.trim().toUpperCase());
      setCouponMsg("Coupon applied.");
    } else {
      setCoupon("");
      setCouponMsg("This code is not valid.");
    }
  };
  const waMessage = `Hi LEVA, I want to order:\n${[...lines.map((p) => `${p.name} x ${items[p.slug]}`), ...bundleLines.map((b) => `${b.name} x ${bundleItems[b.slug]}`), ...(totals.customCount ? [`Custom bundle (${totals.customCount} items)`] : [])].join("\n")}\nTotal: ${formatPKR(totals.total)}`;

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          aria-hidden="true"
        />
      )}
      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent className="flex w-full flex-col gap-0 border-l-primary/20 bg-background p-0 sm:max-w-md z-50">
          <SheetHeader className="border-b border-primary/20 p-5 text-left">
            <SheetTitle className="text-2xl font-light">Your cart</SheetTitle>
          <SheetDescription>Cash on Delivery available nationwide.</SheetDescription>
        </SheetHeader>
        {!empty && (
          <div className="border-b border-primary/15 px-5 py-3">
            <p className="mb-2 text-sm">
              {remaining > 0
                ? `Add ${formatPKR(remaining)} more for free delivery`
                : "You unlocked free delivery"}
            </p>
            <Progress
              value={Math.min(100, (totals.payableSubtotal / storeConfig.freeShippingThreshold) * 100)}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5">
          {empty ? (
            <div className="py-10">
              <p className="text-base text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-6">
                <Link to="/shop" onClick={() => setOpen(false)}>
                  Shop now
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {lines.map((p) => (
                <div
                  key={p.slug}
                  className="grid grid-cols-[64px_1fr_auto] gap-4 border-b border-primary/15 py-4"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-20 w-16 rounded-sm object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-base font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPKR(p.price)}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        magnetic={false}
                        aria-label={`Remove one ${p.name}`}
                        onClick={() => decrement(p.slug)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-7 text-center text-sm">{items[p.slug]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        magnetic={false}
                        aria-label={`Add one ${p.name}`}
                        onClick={() => add(p.slug)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    magnetic={false}
                    aria-label={`Remove ${p.name}`}
                    onClick={() => remove(p.slug)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {bundleLines.map((b) => (
                <div
                  key={b.slug}
                  className="grid grid-cols-[64px_1fr_auto] gap-4 border-b border-primary/15 py-4"
                >
                  <div className="grid h-20 w-16 place-items-center rounded-sm bg-secondary text-lg font-light">
                    ×{b.productSlugs.length}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-medium">{b.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPKR(b.price)}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        magnetic={false}
                        aria-label={`Remove one ${b.name}`}
                        onClick={() => decrementBundle(b.slug)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-7 text-center text-sm">{bundleItems[b.slug]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        magnetic={false}
                        aria-label={`Add one ${b.name}`}
                        onClick={() => addBundle(b.slug)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    magnetic={false}
                    aria-label={`Remove ${b.name}`}
                    onClick={() => removeBundle(b.slug)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <CustomBundleLine />
              <div className="py-4">
                <label htmlFor="coupon" className="text-xs font-medium uppercase tracking-wider">
                  Coupon code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. LEVA10"
                    className="min-h-11 min-w-0 flex-1 border border-primary/30 bg-transparent px-3 text-base"
                  />
                  <Button variant="outline" magnetic={false} onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
                {couponMsg && (
                  <p className="mt-2 text-sm" role="status">
                    {couponMsg}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        {!empty && (
          <div className="border-t border-primary/20 bg-background p-5">
            <div className="space-y-1 text-sm">
              <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row label="Discount" value={`-${formatPKR(totals.discount)}`} />
              )}
              <Row label="Delivery" value={totals.shipping ? formatPKR(totals.shipping) : "Free"} />
              <Row label="Total" value={formatPKR(totals.total)} strong />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery in {storeConfig.deliveryEstimate}.
            </p>
            <Button asChild className="mt-4 h-12 w-full">
              <Link to="/checkout" onClick={() => setOpen(false)}>
                Checkout · {formatPKR(totals.total)}
              </Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 h-11 w-full">
              <a href={whatsappLink(waMessage)} target="_blank" rel="noreferrer">
                <MessageCircle /> Order on WhatsApp
              </a>
            </Button>
            <CheckoutTrust />
          </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "pt-1 text-lg font-medium" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
