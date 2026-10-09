"use client";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence, animate, useReducedMotion } from "motion/react";
import { Check, MessageCircle, Minus, Plus, ShoppingBag, Zap, ChevronUp } from "lucide-react";
import { products } from "@/data/products";
import { bundleTiers, getCustomBundle } from "@/data/bundleRules";
import { formatPKR, getShipping, storeConfig } from "@/config/store";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/bundles/build")({
  head: () => ({
    meta: [
      { title: "Build Your Own Ritual — LEVA" },
      { name: "description", content: "Pick your LEVA products and save up to 20% with a custom skincare bundle." },
      { property: "og:title", content: "Build Your Own LEVA Ritual" },
      { property: "og:description", content: "2 products = 10% off, 3 products = 20% off." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuildBundle,
});

const MAX_SLOTS = 3;

function Money({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = formatPKR(value);
      return;
    }
    const c = animate(prev.current, value, {
      duration: 0.6,
      onUpdate: (v) => (el.textContent = formatPKR(Math.round(v))),
    });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <span ref={ref}>{formatPKR(value)}</span>;
}

function BuildBundle() {
  const setCustom = useCart((s) => s.setCustom);
  const navigate = useNavigate();
  const [sel, setSel] = useState<Record<string, number>>({});
  const [sheet, setSheet] = useState(false);
  // hydrate from persisted cart after mount (avoids SSR mismatch)
  useEffect(() => setSel({ ...useCart.getState().custom }), []);

  const cb = getCustomBundle(sel);
  const shipping = cb.count ? getShipping(cb.price) : 0;
  const ready = cb.count >= bundleTiers[0].minItems;
  const top = bundleTiers[bundleTiers.length - 1] ?? { minItems: 3, rate: 0.2 };
  const change = (slug: string, d: number) =>
    setSel((s) => ({ ...s, [slug]: Math.max(0, Math.min(10, (s[slug] ?? 0) + d)) }));
  const toggle = (slug: string) =>
    setSel((s) => ({ ...s, [slug]: s[slug] ? 0 : 1 }));

  const units = products.flatMap((p) => Array.from({ length: sel[p.slug] ?? 0 }, () => p));
  const hint = cb.next
    ? `Add ${cb.next.need} more to unlock ${Math.round(cb.next.rate * 100)}% off`
    : `Top discount unlocked: ${Math.round(top.rate * 100)}% off`;
  const progress = Math.min(100, (cb.count / top.minItems) * 100);

  const add = () => setCustom(sel);
  const buy = () => {
    useCart.setState({
      custom: Object.fromEntries(Object.entries(sel).filter(([, q]) => q > 0)),
      open: false,
    });
    setSheet(false);
    void navigate({ to: "/checkout" });
  };
  const waMsg = [
    "Hi LEVA, I'd like to order my custom bundle:",
    ...products
      .filter((p) => sel[p.slug])
      .map((p) => `• ${p.name} × ${sel[p.slug]} — ${formatPKR(p.price * (sel[p.slug] ?? 0))}`),
    `Subtotal: ${formatPKR(cb.original)}`,
    `Bundle discount: -${formatPKR(cb.discount)}`,
    `Delivery: ${shipping ? formatPKR(shipping) : "Free"}`,
    `Total: ${formatPKR(cb.price + shipping)}`,
  ].join("\n");

  const panel = (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: Math.max(MAX_SLOTS, units.length) }).map((_, i) => {
          const p = units[i];
          return (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-primary/25 bg-secondary">
              <AnimatePresence>
                {p ? (
                  <motion.img
                    key={p.slug + i}
                    src={p.image}
                    alt={p.name}
                    initial={{ opacity: 0, y: -24, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-medium text-primary">{hint}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <motion.div className="h-full origin-left rounded-full bg-primary" animate={{ scaleX: progress / 100 }} initial={false} />
      </div>
      <div className="mt-4 space-y-2 border-t border-primary/15 pt-4 text-sm">
        <Row label={`Subtotal (${cb.count} item${cb.count === 1 ? "" : "s"})`} value={formatPKR(cb.original)} />
        <Row
          label={`Bundle discount${cb.rate ? ` (${Math.round(cb.rate * 100)}%)` : ""}`}
          value={cb.discount ? `-${formatPKR(cb.discount)}` : "-"}
          accent={cb.discount > 0}
        />
        <Row
          label={`Delivery (free over ${formatPKR(storeConfig.freeShippingThreshold)})`}
          value={!cb.count ? "-" : shipping ? formatPKR(shipping) : "Free"}
        />
        <Row label="Total" value={formatPKR(cb.price + shipping)} strong />
      </div>
      <p className="mt-3 rounded-full bg-secondary px-3 py-1.5 text-center text-sm font-medium text-foreground">
        You save <Money value={cb.discount} />
      </p>
      <div className="mt-4 grid gap-2">
        <Button className="h-12 w-full" disabled={!ready} onClick={add}>
          <ShoppingBag /> Add bundle to cart
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 w-full" disabled={!ready} onClick={buy}>
            <Zap /> Buy now
          </Button>
          {ready ? (
            <Button asChild variant="outline" className="h-12 w-full">
              <a href={whatsappLink(waMsg)} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="h-12 w-full" disabled>
              <MessageCircle /> WhatsApp
            </Button>
          )}
        </div>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">Choose at least 2 items to make a bundle.</p>
        )}
      </div>
    </div>
  );

  return (
    <main className="px-4 pb-44 pt-24 md:px-[5vw] md:pb-20 md:pt-36">
      <section className="max-h-[220px] rounded-3xl bg-gradient-to-br from-background via-secondary to-accent/20 px-5 py-6 md:px-8">
        <p className="eyebrow">Bundles / Build your own</p>
        <h1 className="mt-1 text-3xl font-light text-foreground md:text-4xl">Build your own ritual</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Mix any LEVA products. The more you add, the more you save.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {bundleTiers.map((t) => {
            const on = cb.count >= t.minItems;
            return (
              <span
                key={t.minItems}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 bg-white text-foreground"}`}
              >
                {t.minItems} products = {Math.round(t.rate * 100)}% off
              </span>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {products.map((p) => {
            const q = sel[p.slug] ?? 0;
            return (
              <li
                key={p.slug}
                className={`relative overflow-hidden rounded-2xl border bg-white transition-shadow ${q ? "border-primary ring-2 ring-primary" : "border-primary/15"}`}
              >
                <AnimatePresence>
                  {q > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
                      aria-hidden
                    >
                      <Check className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-3 md:p-4">
                  <h2 className="text-sm font-medium md:text-base">{p.name}</h2>
                  <p className="text-sm text-muted-foreground">{formatPKR(p.price)}</p>
                  <div className="mt-2 flex items-center justify-between rounded-full border border-primary/25">
                    <Button variant="ghost" size="icon" magnetic={false} aria-label={`Remove one ${p.name}`} disabled={!q} onClick={() => change(p.slug, -1)}>
                      <Minus />
                    </Button>
                    <span aria-live="polite" className="text-base font-medium">{q}</span>
                    <Button variant="ghost" size="icon" magnetic={false} aria-label={`Add one ${p.name}`} onClick={() => change(p.slug, 1)}>
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    variant={q ? "default" : "outline"}
                    magnetic={false}
                    className="mt-2 h-11 w-full text-xs"
                    aria-pressed={q > 0}
                    onClick={() => toggle(p.slug)}
                  >
                    {q ? "In bundle · Remove" : "Add to bundle"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="hidden h-fit rounded-2xl border border-primary/15 bg-white p-5 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:block">
          <h2 className="mb-4 text-xl font-light">Your bundle</h2>
          {panel}
        </aside>
      </div>

      {/* Mobile sticky summary above the tab bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-primary/15 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex min-h-11 w-full items-center justify-between text-left text-sm"
          aria-label="Open bundle summary"
        >
          <span>
            <span className="block font-medium">
              {cb.count} item{cb.count === 1 ? "" : "s"} · {formatPKR(cb.price + shipping)}
            </span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            View <ChevronUp className="size-4" />
          </span>
        </button>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full origin-left bg-primary" animate={{ scaleX: progress / 100 }} initial={false} />
        </div>
      </div>
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <SheetHeader>
            <SheetTitle className="text-xl font-light">Your bundle</SheetTitle>
          </SheetHeader>
          <div className="px-4">{panel}</div>
        </SheetContent>
      </Sheet>
    </main>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "border-t border-primary/15 pt-2 text-base font-medium" : ""} ${accent ? "text-primary" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
