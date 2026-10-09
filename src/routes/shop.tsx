"use client";
import { Outlet, createFileRoute } from "@/lib/router-compat";

export const Route = createFileRoute("/shop")({
  component: ShopLayout,
});

function ShopLayout() {
  return <Outlet />;
}
