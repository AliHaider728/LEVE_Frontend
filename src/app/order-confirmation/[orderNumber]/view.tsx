"use client";
import { Route } from "@/routes/order-confirmation.$orderNumber";

export default function View() {
  const Component = Route.options.component as () => React.ReactNode;
  return <Component />;
}
