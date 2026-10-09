"use client";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@/lib/router-compat";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { formatPKR, storeConfig } from "@/config/store";
import { getOrder, type LocalOrder } from "@/lib/orders";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-confirmation/$orderNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — LEVA` },
      { name: "description", content: "Your LEVA Pakistan order confirmation." },
      { property: "og:title", content: "LEVA Order Confirmed" },
      { property: "og:description", content: "Your LEVA order has been received." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { orderNumber } = Route.useParams();
  const [order, setOrder] = useState<LocalOrder | null>();
  useEffect(() => setOrder(getOrder(orderNumber) ?? null), [orderNumber]);
  if (order === undefined) return <main className="min-h-[60vh] px-6 pt-40" />;
  if (!order)
    return (
      <main className="px-6 pb-24 pt-32 md:px-[10vw] md:pt-40">
        <h1 className="text-3xl font-light">We could not find this order on this device.</h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/track-order">Track order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </main>
    );
  const msg = `Hi LEVA, please confirm my order ${order.orderNumber}. Total: ${formatPKR(order.total)}.`;
  return (
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-28 text-center md:pt-40">
      <CheckCircle2 className="mx-auto size-16 text-accent" />
      <h1 className="mt-6 text-3xl font-light md:text-5xl">
        Thank you, {order.customer.fullName.split(" ")[0]}!
      </h1>
      <p className="mt-3 text-base text-muted-foreground">Your order is placed.</p>
      <p className="mt-6 inline-block border border-primary/30 px-5 py-3 text-lg">
        Order number <strong className="font-medium">{order.orderNumber}</strong>
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        {order.status} · Delivery in {storeConfig.deliveryEstimate}
      </p>
      <div className="mt-10 border-y border-primary/20 py-5 text-left">
        {order.items.map((i) => (
          <div key={i.name} className="flex justify-between py-1.5 text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatPKR(i.total)}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1 border-t border-primary/15 pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatPKR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.shipping ? formatPKR(order.shipping) : "Free"}</span>
          </div>
          <div className="flex justify-between pt-2 text-lg font-medium">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>
      </div>
      {order.paymentMethod !== "cod" && (
        <p className="mt-6 bg-secondary p-4 text-left text-sm">
          We are checking your payment. We will confirm on WhatsApp soon.
        </p>
      )}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild className="h-12">
          <a href={whatsappLink(msg)} target="_blank" rel="noreferrer">
            <MessageCircle /> Confirm on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link to="/track-order" search={{ order: order.orderNumber }}>
            Track order
          </Link>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Want faster checkout next time? An account is optional, and your details are already saved
        on this device.
      </p>
    </main>
  );
}
