"use client";
import { useState, type FormEvent } from "react";
import { createFileRoute } from "@/lib/router-compat";
import { z } from "zod";
import { formatPKR, storeConfig } from "@/config/store";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, Loader2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/track-order")({
  validateSearch: (s: Record<string, unknown>): { order?: string } =>
    typeof s["order"] === "string" ? { order: s["order"] } : {},
  head: () => ({
    meta: [
      { title: "Track Your Order — LEVA Pakistan" },
      {
        name: "description",
        content: "Check the status of your LEVA order with your order number and mobile number.",
      },
      { property: "og:title", content: "Track Your LEVA Order" },
      {
        property: "og:description",
        content: "Enter your order number and phone to see your order status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrder,
});

const schema = z.object({
  order: z
    .string()
    .trim()
    .min(3, "Please enter your order number or courier tracking number."),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

interface TrackItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  selectedVariant?: string | null;
}

interface TrackStage {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
}

interface TrackResult {
  orderNumber: string;
  orderId: string;
  date: string;
  createdAt?: string;
  status: string;
  isCancelled: boolean;
  trackingNumber: string | null;
  city: string;
  province?: string;
  paymentMethod: string;
  deliveryEstimate: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  items: TrackItem[];
  stages: TrackStage[];
  statusHistory?: Array<{ status: string; note?: string; timestamp: string }>;
}

function TrackOrder() {
  const search = Route.useSearch();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/store/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Leva-Storefront": "1",
        },
        body: JSON.stringify({
          orderId: r.data.order,
          phone: r.data.phone,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        setErrorMsg(
          data?.error ||
            "We could not find this order. Please verify your order number and mobile number.",
        );
        setResult(null);
      } else {
        setResult(data as TrackResult);
      }
    } catch {
      setErrorMsg("Unable to reach the tracking server. Please check your internet connection and try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (key: string) => {
    switch (key) {
      case "placed":
        return Clock;
      case "confirmed":
        return CheckCircle2;
      case "shipped":
        return Truck;
      case "delivered":
        return PackageCheck;
      default:
        return CheckCircle2;
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-28 md:pt-40">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-light md:text-4xl">Track Your Order</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Enter your order number or tracking code along with your mobile number to view live order progress.
        </p>
      </div>

      {/* Tracking Form */}
      <form onSubmit={submit} noValidate className="mt-8 grid gap-5 rounded-2xl border border-primary/10 bg-secondary/20 p-5 sm:p-6">
        <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
          Order Number or Tracking Code
          <input
            name="order"
            defaultValue={search.order}
            placeholder="e.g. LEV-MVJA1Z2Z-AEAF0F or TCS-12345"
            className="min-h-12 border border-primary/20 bg-background px-3.5 text-base normal-case tracking-normal rounded-xl outline-none focus:border-primary transition-colors"
          />
          {errors["order"] && (
            <span role="alert" className="text-xs normal-case tracking-normal text-destructive font-medium">
              {errors["order"]}
            </span>
          )}
        </label>
        <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
          Mobile Number (Optional)
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0300-1234567 (optional)"
            className="min-h-12 border border-primary/20 bg-background px-3.5 text-base normal-case tracking-normal rounded-xl outline-none focus:border-primary transition-colors"
          />
          {errors["phone"] && (
            <span role="alert" className="text-xs normal-case tracking-normal text-destructive font-medium">
              {errors["phone"]}
            </span>
          )}
        </label>
        <Button type="submit" disabled={loading} className="h-12 font-medium tracking-wide">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Order Status…
            </>
          ) : (
            "Track Order"
          )}
        </Button>
      </form>

      {/* Error state */}
      {errorMsg && (
        <div role="alert" className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive">{errorMsg}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Need assistance?{" "}
                <a
                  className="font-semibold text-primary underline underline-offset-2"
                  href={whatsappLink("Hi LEVA, I need help tracking my order.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Message us on WhatsApp
                </a>{" "}
                and our customer support team will assist you immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Found Order Results */}
      {result && (
        <div role="status" className="mt-8 space-y-6">
          {/* Order Header Card */}
          <div className="rounded-2xl border border-primary/15 bg-background p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/10 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">Order Number</span>
                <p className="font-mono text-lg font-bold text-foreground mt-0.5">{result.orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Placed on {new Date(result.createdAt || result.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  result.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : (result.status === 'Shipped' || result.status === 'Order Confirmed')
                      ? 'bg-blue-100 text-blue-800'
                      : result.isCancelled
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                }`}>
                  {result.status}
                </span>
              </div>
            </div>

            {/* Courier Tracking Code (if present) */}
            {result.trackingNumber && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">Courier Tracking Number</span>
                  <span className="font-mono text-sm font-bold text-blue-950">{result.trackingNumber}</span>
                </div>
                <span className="text-xs text-blue-800/80">Dispatched via TCS / Leopards</span>
              </div>
            )}

            {/* Cancellation Notice */}
            {result.isCancelled && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <strong className="text-red-900 text-sm block">Order Cancelled</strong>
                <p className="text-xs text-red-800/90 mt-1">This order has been cancelled. If you believe this is an error, please message us on WhatsApp.</p>
              </div>
            )}

            {/* Status Timeline */}
            {!result.isCancelled && (
              <div className="mt-6 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Order Status Timeline</h2>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:bottom-2 before:left-[11px] sm:before:left-[15px] before:top-2 before:w-[2px] before:bg-primary/15">
                  {result.stages.map((stage) => {
                    const Icon = getStageIcon(stage.key);
                    const isDone = stage.completed;
                    const isCurrent = stage.current;

                    return (
                      <div key={stage.key} className="relative flex items-start gap-4">
                        <div className={`absolute -left-6 sm:-left-8 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 transition-colors ${
                          isDone
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isCurrent
                              ? 'border-primary bg-background text-primary ring-4 ring-primary/10'
                              : 'border-muted-foreground/30 bg-background text-muted-foreground/40'
                        }`}>
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${isDone || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {stage.label}
                            </span>
                            {stage.date && (
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(stage.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Products Card */}
          <div className="rounded-2xl border border-primary/15 bg-background p-5 sm:p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Ordered Items</h2>
            <div className="divide-y divide-primary/10 border-y border-primary/10">
              {result.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image && item.image.trim() ? (
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover border border-primary/10 bg-secondary/20 shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl border border-primary/10 bg-secondary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {item.name ? item.name.slice(0, 2).toUpperCase() : 'LV'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      {item.selectedVariant && (
                        <p className="text-[11px] text-muted-foreground">{item.selectedVariant}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPKR(item.price)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground whitespace-nowrap">{formatPKR(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPKR(result.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span>{result.shippingFee === 0 ? "FREE" : formatPKR(result.shippingFee)}</span>
              </div>
              {result.discountAmount > 0 && (
                <div className="flex justify-between font-medium text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatPKR(result.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-primary/10 pt-2 text-sm font-bold text-foreground">
                <span>Total Amount</span>
                <span>{formatPKR(result.total)}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="mt-6 rounded-xl bg-secondary/30 p-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <span className="font-semibold text-foreground">Delivery City:</span> {result.city || 'Pakistan'} {result.province ? `(${result.province})` : ''}
              </div>
              <div>
                <span className="font-semibold text-foreground">Payment:</span> {result.paymentMethod}
              </div>
              <div>
                <span className="font-semibold text-foreground">Estimate:</span> {result.deliveryEstimate || storeConfig.deliveryEstimate}
              </div>
            </div>
          </div>

          {/* Support Link */}
          <div className="text-center pt-2">
            <a
              href={whatsappLink(`Hi LEVA, I have a question regarding my order #${result.orderNumber}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Need help with this order? Chat with us on WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
