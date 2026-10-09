import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const items = [
  [BadgeCheck, "Cash on Delivery"],
  [ShieldCheck, "100% Authentic"],
  [RotateCcw, "Easy Returns (7 days)"],
  [Truck, "Nationwide Delivery"],
] as const;

export function TrustRow() {
  return (
    <div className="grid grid-cols-2 gap-px border border-primary/20 bg-primary/20 md:grid-cols-4">
      {items.map(([Icon, label]) => (
        <div
          key={label}
          className="flex min-h-20 items-center gap-3 bg-background px-4 text-xs font-medium uppercase tracking-wider"
        >
          <Icon className="size-5 shrink-0" />
          {label}
        </div>
      ))}
    </div>
  );
}
