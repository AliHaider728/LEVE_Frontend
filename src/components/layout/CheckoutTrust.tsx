import { BadgeCheck, Banknote, PackageOpen, RotateCcw } from "lucide-react";

const points = [
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: PackageOpen, label: "Open parcel on delivery" },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: BadgeCheck, label: "100% authentic" },
];

export function CheckoutTrust() {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-foreground">
      {points.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-primary" />
          {label}
        </li>
      ))}
    </ul>
  );
}
