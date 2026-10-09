import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "saving" | "stock" | "sold";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center bg-background px-3 text-xs font-medium uppercase tracking-widest text-foreground",
        variant === "saving" && "bg-accent",
        variant === "sold" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
