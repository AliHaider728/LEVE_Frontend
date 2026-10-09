"use client";
import { Route } from "@/routes/forgot-password";

export default function View() {
  const Component = Route.options.component as () => React.ReactNode;
  return <Component />;
}
