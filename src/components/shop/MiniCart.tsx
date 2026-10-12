import { useStoreData } from "@/store/catalog";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/store/cart";
import { getCartTotals } from "@/lib/cart-totals";
import { formatPKR, getFreeShippingRemaining } from "@/config/store";
import { Progress } from "@/components/ui/progress";

export function MiniCart() {
  const { settings: storeConfig } = useStoreData();
  const { items, bundles, coupon, setOpen, custom } = useCart();
  const count =
    Object.values(items).reduce((a, b) => a + b, 0) +
    Object.values(bundles).reduce((a, b) => a + b, 0) +
    Object.values(custom).reduce((a, b) => a + b, 0);
  const totals = getCartTotals(items, bundles, coupon, custom, useStoreData.getState());
  const remaining = getFreeShippingRemaining(totals.payableSubtotal, storeConfig);
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 24 }}
          className="fixed right-6 top-1/2 z-30 hidden w-56 -translate-y-1/2 rounded-2xl border border-primary/20 bg-background p-4 text-left shadow-lg lg:block"
          aria-label="Open cart"
        >
          <p className="eyebrow">Your cart</p>
          <p className="mt-1 text-sm">
            {count} item{count > 1 ? "s" : ""} ·{" "}
            <strong className="font-medium">{formatPKR(totals.subtotal)}</strong>
          </p>
          <Progress
            className="mt-3"
            value={Math.min(100, (totals.payableSubtotal / storeConfig.freeShippingThreshold) * 100)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {remaining > 0
              ? `Add ${formatPKR(remaining)} for free delivery`
              : "Free delivery unlocked"}
          </p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
