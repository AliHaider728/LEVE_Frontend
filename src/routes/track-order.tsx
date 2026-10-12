"use client";
import { useState, type FormEvent } from "react";
import { createFileRoute } from "@/lib/router-compat";
import { z } from "zod";
import { formatPKR, storeConfig } from "@/config/store";
import { readOrders, type LocalOrder } from "@/lib/orders";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

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
    .regex(/^(LEVA-\d{5}|LEV-[A-Z0-9]+-[A-Z0-9]+)$/i, "Order number looks like LEVA-10001."),
  phone: z
    .string()
    .trim()
    .regex(/^03\d{2}-?\d{7}$/, "Enter a mobile number like 0300-1234567."),
});

function TrackOrder() {
  const search = Route.useSearch();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LocalOrder | null | undefined>();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    const digits = (v: string) => v.replace(/\D/g, "");
    setResult(
      readOrders().find(
        (o) =>
          o.orderNumber.toUpperCase() === r.data.order.toUpperCase() &&
          digits(o.customer.mobile) === digits(r.data.phone),
      ) ?? null,
    );
  };
  return (
    <main className="mx-auto max-w-xl px-5 pb-28 pt-28 md:pt-40">
      <h1 className="text-3xl font-light md:text-4xl">Track your order</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Enter your order number and mobile number.
      </p>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
          Order number
          <input
            name="order"
            defaultValue={search.order}
            placeholder="LEVA-10001"
            className="min-h-12 border border-primary/30 bg-transparent px-3 text-base normal-case tracking-normal"
          />
          {errors["order"] && (
            <span role="alert" className="text-sm normal-case tracking-normal text-destructive">
              {errors["order"]}
            </span>
          )}
        </label>
        <label className="grid gap-2 text-xs font-medium uppercase tracking-wider">
          Mobile number
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="03XX-XXXXXXX"
            className="min-h-12 border border-primary/30 bg-transparent px-3 text-base normal-case tracking-normal"
          />
          {errors["phone"] && (
            <span role="alert" className="text-sm normal-case tracking-normal text-destructive">
              {errors["phone"]}
            </span>
          )}
        </label>
        <Button type="submit" className="h-12">
          Track order
        </Button>
      </form>
      {result === null && (
        <p role="status" className="mt-8 bg-secondary p-4 text-sm">
          We could not find this order. Please check the details or{" "}
          <a
            className="underline"
            href={whatsappLink("Hi LEVA, I need help tracking my order.")}
            target="_blank"
            rel="noreferrer"
          >
            message us on WhatsApp
          </a>
          .
        </p>
      )}
      {result && (
        <div role="status" className="mt-8 border border-primary/20 p-5">
          <p className="text-sm text-muted-foreground">{result.orderNumber}</p>
          <p className="mt-1 text-xl font-medium">{result.status}</p>
          <p className="mt-2 text-sm">
            Total {formatPKR(result.total)} · Delivery in {storeConfig.deliveryEstimate}
          </p>
        </div>
      )}
    </main>
  );
}
