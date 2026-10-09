"use client";
import { Route } from "@/routes/bundles.build";

export default function View() {
  const Component = Route.options.component as () => React.ReactNode;
  return <Component />;
}
