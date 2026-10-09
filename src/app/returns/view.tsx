"use client";
import { Route } from "@/routes/returns";

export default function View() {
  const Component = Route.options.component as () => React.ReactNode;
  return <Component />;
}
