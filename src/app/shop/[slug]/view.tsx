"use client";
import type { Product } from "@/data/products";
import { Route } from "@/routes/shop.$slug";

export default function View({ initialProduct }: { initialProduct?: Product | null }) {
  const Component = Route.options.component as (props: { initialProduct?: Product | null }) => React.ReactNode;
  return <Component initialProduct={initialProduct} />;
}
