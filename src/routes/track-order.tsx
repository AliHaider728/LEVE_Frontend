"use client";
import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute } from "@/lib/router-compat";
import { z } from "zod";
import { formatPKR, storeConfig } from "@/config/store";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, Loader2, MessageCircle, Search } from "lucide-react";

export const Route = createFileRoute("/track-order")({
  validateSearch: (s: Record<string, unknown>): { order?: string; query?: string } => ({
    order: typeof s["order"] === "string" ? s["order"] : undefined,
    query: typeof s["query"] === "string" ? s["query"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Order — LEVA Pakistan" },
      {
        name: "description",
        content: "Track your LEVA order using your WhatsApp/Mobile number, Email, or Order ID.",
      },
      { property: "og:title", content: "Track Your LEVA Order" },
      {
        property: "og:description",
        content: "Enter your WhatsApp number, email, or order number to see live tracking details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrder,
});

const schema = z.object({
  query: z
    .string()
    .trim()
    .min(3, "Please enter your WhatsApp/Mobile number, Email, or Order ID."),
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

interface OrderSummaryItem {
  orderId: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  trackingNumber?: string | null;
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
  multipleOrders?: OrderSummaryItem[];
}

function TrackOrder() {
  const [queryInput, setQueryInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const fetchTracking = async (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || trimmed.length < 3) {
      setErrors({ query: "Please enter your WhatsApp/Mobile number, Email, or Order ID." });
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
          query: trimmed,
          orderId: trimmed,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        setErrorMsg(
          data?.error ||
            "No order found matching these details. Please verify your WhatsApp number, Email, or Order ID.",
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

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    await fetchTracking(r.data.query);
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
          Enter any one detail — your WhatsApp/Mobile number, Email address, or Order ID — to check your live order status.
        </p>
      </div>

      {/* Unified Single-Field Tracking Form */}
      <form onSubmit={submit} noValidate className="mt-8 grid gap-4 rounded-2xl border border-primary/10 bg-secondary/20 p-5 sm:p-6">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
          WhatsApp / Mobile Number, Email, or Order ID
          <div className="relative">
            <input
              name="query"
              value={queryInput}
              onChange={(e) => {
                setQueryInput(e.target.value);
                if (errors["query"]) setErrors({});
              }}
              placeholder="e.g. 03147080907, customer@example.com, or LEV-..."
              autoComplete="on"
              className="min-h-12 w-full border border-primary/20 bg-background px-3.5 pr-10 text-base normal-case tracking-normal rounded-xl outline-none focus:border-primary transition-colors"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors["query"] && (
            <span role="alert" className="text-xs normal-case tracking-normal text-destructive font-medium">
              {errors["query"]}
            </span>
          )}
          <span className="text-[11px] normal-case tracking-normal text-muted-foreground font-normal">
            No need to remember an order ID — you can also track instantly with your WhatsApp number or Email.
          </span>
        </label>

        <Button type="submit" disabled={loading} className="h-12 font-medium tracking-wide">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Locating Your Order…
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
                Need quick assistance?{" "}
                <a
                  className="font-semibold text-primary underline underline-offset-2"
                  href={whatsappLink("Hi LEVA, I need help finding my order details.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Message us on WhatsApp
                </a>{" "}
                and we will check it for you immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Orders Selector (if customer placed multiple orders) */}
      {result?.multipleOrders && result.multipleOrders.length > 1 && (
        <div className="mt-6 rounded-2xl border border-primary/15 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            Multiple orders found for this contact ({result.multipleOrders.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {result.multipleOrders.map((ord) => (
              <button
                key={ord.orderId}
                type="button"
                onClick={() => {
                  setQueryInput(ord.orderId);
                  void fetchTracking(ord.orderId);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors ${
                  result.orderId === ord.orderId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/40 text-foreground border-primary/15 hover:bg-secondary"
                }`}
              >
                {ord.orderNumber} ({ord.status})
              </button>
            ))}
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
                    : (result.status === 'Shipped' || result.status === 'Order Confirmed' || result.status === 'Processing')
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
                <span className="text-xs text-blue-800/80">Dispatched via Courier</span>
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