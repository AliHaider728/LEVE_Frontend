"use client";
import { createFileRoute, Outlet } from "@/lib/router-compat";

export const Route = createFileRoute("/bundles")({ component: () => <Outlet /> });
