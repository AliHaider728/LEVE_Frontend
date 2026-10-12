"use client";
import { useStoreData } from "@/store/catalog";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@/lib/router-compat";
import {
  Banknote,
  Building2,
  ChevronDown,
  CreditCard,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { z } from "zod";


import { cities, cityProvinces, provinces } from "@/data/cities";
import { formatPKR, getFreeShippingRemaining } from "@/config/store";
import { getCartTotals } from "@/lib/cart-totals";
import { saveOrder, type PaymentMethod } from "@/lib/orders";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { API_URL } from "@/lib/api/client";
import { buildCheckoutPayload, placeOrder } from "@/lib/api/checkout";
import { CatalogStatus } from "@/components/product/CatalogStatus";
import { CheckoutTrust } from "@/components/layout/CheckoutTrust";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
    mobile: z
      .string()
      .trim()
      .regex(/^03\d{2}-?\d{7}$/, "Enter a mobile number like 0300-1234567."),
    email: z.string().trim().email("This email does not look right.").or(z.literal("")),
    street: z
      .string()
      .trim()
      .min(8, "Please enter your full address (house, street, area).")
      .max(300),
    city: z.string().trim().min(2, "Please choose your city."),
    province: z.string().trim().min(2, "Please choose your province."),
    notes: z.string().trim().max(500),
    payment: z.enum(["cod", "jazzcash", "easypaisa", "bank"]),
    transactionId: z.string().trim().max(100),
  })
  .superRefine((d, ctx) => {
    if (d.payment !== "cod" && !d.transactionId)
      ctx.addIssue({
        code: "custom",
        path: ["transactionId"],
        message: "Please enter your transaction ID.",
      });
  });

const payments = [
  { id: "cod", label: "Cash on Delivery", note: "Pay when you receive", icon: Banknote },
  { id: "jazzcash", label: "JazzCash", note: "Send, then add transaction ID", icon: Smartphone },
  { id: "easypaisa", label: "Easypaisa", note: "Send, then add transaction ID", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", note: "Send, then add transaction ID", icon: Building2 },
] as const;

const REMEMBER_KEY = "leva-checkout-details";
type Saved = {
  fullName?: string;
  mobile?: string;
  email?: string;
  street?: string;
  city?: string;
  province?: string;
};

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LEVA Pakistan" },
      {
        name: "description",
        content: "Fast guest checkout for LEVA skincare with Cash on Delivery across Pakistan.",
      },
      { property: "og:title", content: "Checkout — LEVA Pakistan" },
      { property: "og:description", content: "Order LEVA in under a minute. No account needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { products, bundles, settings: storeConfig, loading: storeLoading } = useStoreData();
  const cart = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState("");
  const [saved, setSaved] = useState<Saved>({});
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const submitting = useRef(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(REMEMBER_KEY) ?? "{}") as Saved;
      setSaved(s);
      setCity(s.city ?? "");
      setProvince(s.province ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const totals = getCartTotals(cart.items, cart.bundles, cart.coupon, cart.custom, useStoreData.getState());
  const lines = [
    ...products
      .filter((p) => cart.items[p.slug])
      .map((p) => ({
        name: p.name,
        quantity: cart.items[p.slug] ?? 0,
        total: p.price * (cart.items[p.slug] ?? 0),
      })),
    ...bundles
      .filter((b) => cart.bundles[b.slug])
      .map((b) => ({
        name: b.name,
        quantity: cart.bundles[b.slug] ?? 0,
        total: b.price * (cart.bundles[b.slug] ?? 0),
      })),
    ...products
      .filter((p) => cart.custom[p.slug])
      .map((p) => ({
        name: `${p.name} (custom bundle)`,
        quantity: cart.custom[p.slug] ?? 0,
        total: p.price * (cart.custom[p.slug] ?? 0),
      })),
    ...(totals.customDiscount
      ? [{ name: "Custom bundle discount", quantity: 1, total: -totals.customDiscount }]
      : []),
  ];
  const remaining = getFreeShippingRemaining(totals.payableSubtotal, storeConfig);
  const waMessage = `Hi LEVA, I want to order:\n${lines.map((l) => `${l.name} x ${l.quantity}`).join("\n")}\nTotal: ${formatPKR(totals.total)}`;

  const onCity = (value: string) => {
    setCity(value);
    const p = cityProvinces[value];
    if (p) setProvince(p);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const result = schema.safeParse({ notes: "", transactionId: "", email: "", ...raw, payment });
    if (!result.success) {
      const errs = Object.fromEntries(
        result.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
      setErrors(errs);
      document.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setFailed("");
    setLoading(true);
    submitting.current = true;
    try {
      const d = result.data;
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({
          fullName: d.fullName,
          mobile: d.mobile,
          email: d.email,
          street: d.street,
          city: d.city,
          province: d.province,
        }),
      );
      if (!API_URL) throw new Error("Online checkout is not configured yet. Please order on WhatsApp.");
      if (d.payment !== "cod") throw new Error("Online checkout currently supports Cash on Delivery. Please choose COD or order on WhatsApp.");
      const fingerprint = JSON.stringify({ details: d, items: cart.items, bundles: cart.bundles, custom: cart.custom, coupon: cart.coupon });
      if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
      const payload = buildCheckoutPayload(d, cart, { products, bundles }, request.current.id);
      const confirmed = await placeOrder(payload, d);
      const orderNumber = confirmed.orderNumber;
      saveOrder(confirmed);
      cart.clear();
      await navigate({ to: "/order-confirmation/$orderNumber", params: { orderNumber } });
    } catch (error) {
      setFailed(error instanceof Error ? error.message : "We couldn’t place your order. Please try again or order on WhatsApp.");
      setLoading(false);
      submitting.current = false;
    }
  };

  if (!lines.length)
    return (
      <main className="px-6 pb-24 pt-32 md:px-[10vw] md:pt-40">
        <h1 className="text-4xl font-light">Your cart is empty.</h1>
        <Button asChild className="mt-8">
          <Link to="/shop">Shop products</Link>
        </Button>
      </main>
    );

  const err = (name: string) =>
    errors[name] ? (
      <span
        id={`${name}-error`}
        role="alert"
        className="text-sm normal-case tracking-normal text-destructive"
      >
        {errors[name]}
      </span>
    ) : null;

  const summary = (
    <>
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.name} className="flex justify-between gap-4 text-sm">
            <span>
              {l.name} × {l.quantity}
            </span>
            <span>{formatPKR(l.total)}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm">
        {remaining > 0
          ? `Add ${formatPKR(remaining)} more for free delivery`
          : "You unlocked free delivery"}
      </p>
      <Progress
        className="mt-2"
        value={Math.min(100, (totals.payableSubtotal / storeConfig.freeShippingThreshold) * 100)}
      />
      <div className="mt-5 space-y-2 text-sm">
        <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`-${formatPKR(totals.discount)}`} />}
        <Row label="Delivery" value={totals.shipping ? formatPKR(totals.shipping) : "Free"} />
        <Row label="Total" value={formatPKR(totals.total)} strong />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Delivery in {storeConfig.deliveryEstimate}. No hidden charges.
      </p>
    </>
  );

  return (
    <main className="px-5 pb-28 pt-24 md:px-[6vw] md:pt-40">
      <p className="eyebrow mb-3">Guest checkout · No account needed</p>
      <h1 className="text-3xl font-light md:text-5xl">Checkout</h1>
      <CatalogStatus />
      <p className="mt-3 text-sm text-muted-foreground">Delivery and savings are estimates until confirmed by the store.</p>

      <div className="mt-6 border border-primary/20 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="flex min-h-12 w-full items-center justify-between px-4 text-sm font-medium"
        >
          <span>{summaryOpen ? "Hide" : "Show"} order summary</span>
          <span className="flex items-center gap-2">
            {formatPKR(totals.total)}
            <ChevronDown
              className={`size-4 transition-transform ${summaryOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        {summaryOpen && <div className="border-t border-primary/15 p-4">{summary}</div>}
      </div>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <Fieldset title="Your details">
            <Input
              name="fullName"
              label="Full name"
              autoComplete="name"
              defaultValue={saved.fullName}
              key={`n${saved.fullName}`}
              error={err("fullName")}
            />
            <Input
              name="mobile"
              label="Mobile number"
              placeholder="03XX-XXXXXXX"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              defaultValue={saved.mobile}
              key={`m${saved.mobile}`}
              error={err("mobile")}
            />
            <Input
              name="email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              defaultValue={saved.email}
              key={`e${saved.email}`}
              error={err("email")}
            />
          </Fieldset>
          <Fieldset title="Delivery address">
            <Input
              name="street"
              label="Full address"
              placeholder="House no, street, area"
              autoComplete="street-address"
              defaultValue={saved.street}
              key={`s${saved.street}`}
              error={err("street")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
                City
                <input
                  name="city"
                  list="pk-cities"
                  value={city}
                  onChange={(e) => onCity(e.target.value)}
                  placeholder="Type to search"
                  autoComplete="address-level2"
                  aria-invalid={!!errors["city"]}
                  className="min-h-12 border border-primary/30 bg-transparent px-3 text-base normal-case tracking-normal"
                />
                <datalist id="pk-cities">
                  {cities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {err("city")}
              </label>
              <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
                Province
                <select
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  autoComplete="address-level1"
                  className="min-h-12 border border-primary/30 bg-transparent px-3 text-base normal-case tracking-normal"
                >
                  <option value="">Choose province</option>
                  {provinces.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                {err("province")}
              </label>
            </div>
            <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
              Delivery notes (optional)
              <textarea
                name="notes"
                maxLength={500}
                rows={2}
                className="border border-primary/30 bg-transparent p-3 text-base normal-case tracking-normal"
              />
            </label>
          </Fieldset>
          <Fieldset title="Payment">
            {payments.filter(option => option.id === "cod").map(({ id, label, note, icon: Icon }) => (
              <label
                key={id}
                className={`flex min-h-16 cursor-pointer items-center gap-4 border p-4 ${payment === id ? "border-primary bg-secondary" : "border-primary/20"}`}
              >
                <input
                  type="radio"
                  name="paymentChoice"
                  value={id}
                  checked={payment === id}
                  onChange={() => setPayment(id)}
                  className="size-5 accent-[var(--color-primary)]"
                />
                <Icon className="shrink-0" />
                <span>
                  <strong className="block font-medium">{label}</strong>
                  <small className="text-sm text-muted-foreground">{note}</small>
                </span>
              </label>
            ))}
            <div
              className="flex min-h-16 items-center gap-4 border border-primary/20 p-4 opacity-50"
              aria-disabled="true"
            >
              <input
                type="radio"
                disabled
                className="size-5"
                aria-label="Card payment, coming soon"
              />
              <CreditCard />
              <span>
                <strong className="block font-medium">Card</strong>
                <small className="text-sm">Coming soon</small>
              </span>
            </div>
            {payment !== "cod" && <ManualPayment method={payment} error={err("transactionId")} />}
          </Fieldset>
        </div>

        <aside className="h-fit lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
          <div className="hidden border border-primary/20 p-6 lg:block">
            <h2 className="mb-5 text-xl font-light">Order summary</h2>
            {summary}
          </div>
          {failed && (
            <p role="alert" className="mt-4 bg-secondary p-3 text-sm text-destructive">
              {failed}
            </p>
          )}
          <Button type="submit" className="mt-5 h-12 w-full" disabled={loading || storeLoading} aria-busy={loading}>
            {loading ? "Placing order…" : `Place order · ${formatPKR(totals.total)}`}
          </Button>
          <CheckoutTrust />
          <Button asChild variant="outline" className="mt-4 h-11 w-full">
            <a href={whatsappLink(waMessage, storeConfig.whatsappNumber)} target="_blank" rel="noreferrer">
              <MessageCircle /> Order on WhatsApp instead
            </a>
          </Button>
        </aside>
      </form>
    </main>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5">
      <legend className="mb-4 text-xl font-light">{title}</legend>
      {children}
    </fieldset>
  );
}
function Input({
  label,
  error,
  ...props
}: { label: string; error: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
      {label}
      <input
        {...props}
        aria-invalid={!!error}
        maxLength={props.maxLength ?? 300}
        className="min-h-12 border border-primary/30 bg-transparent px-3 text-base normal-case tracking-normal"
      />
      {error}
    </label>
  );
}
function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between ${strong ? "border-t border-primary/20 pt-3 text-lg font-medium" : ""}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
function ManualPayment({
  method,
  error,
}: {
  method: Exclude<PaymentMethod, "cod">;
  error: React.ReactNode;
}) {
  const { settings: storeConfig } = useStoreData();
  const lines =
    method === "jazzcash"
      ? [
          ["JazzCash number", storeConfig.jazzCash.number],
          ["Account title", storeConfig.jazzCash.accountTitle],
        ]
      : method === "easypaisa"
        ? [
            ["Easypaisa number", storeConfig.easypaisa.number],
            ["Account title", storeConfig.easypaisa.accountTitle],
          ]
        : [
            ["Bank", storeConfig.bank.name],
            ["Account title", storeConfig.bank.accountTitle],
            ["IBAN", storeConfig.bank.iban],
          ];
  return (
    <div className="grid gap-4 border border-primary/20 bg-secondary p-5">
      <dl className="grid gap-1 text-sm">
        {lines.map(([k, v]) => (
          <div key={k} className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <Input name="transactionId" label="Transaction ID" error={error} />
      <p className="text-sm text-muted-foreground">
        We confirm your order after checking the payment.
      </p>
    </div>
  );
}
