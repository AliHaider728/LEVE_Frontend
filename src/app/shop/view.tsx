"use client";
import { Route } from "@/routes/shop.index";

export default function View() {
  const Component = Route.options.component as () => React.ReactNode;
  return <Component />;
}
