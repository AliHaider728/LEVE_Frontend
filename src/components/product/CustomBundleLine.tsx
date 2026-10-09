import { Link } from "@/lib/router-compat";
import { Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { getCustomBundle } from "@/data/bundleRules";
import { formatPKR } from "@/config/store";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

/** Grouped "Your custom bundle" line used by the cart drawer and cart page. */
export function CustomBundleLine() {
  const custom = useCart((s) => s.custom);
  const clearCustom = useCart((s) => s.clearCustom);
  const setOpen = useCart((s) => s.setOpen);
  const cb = getCustomBundle(custom);
  if (!cb.count) return null;
  const picked = products.filter((p) => custom[p.slug]);
  return (
    <div className="border-b border-primary/15 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-medium">Your custom bundle</p>
          <ul className="mt-1 text-sm text-muted-foreground">
            {picked.map((p) => (
              <li key={p.slug}>
                {p.name} × {custom[p.slug]}
              </li>
            ))}
          </ul>
          {cb.discount > 0 && (
            <p className="mt-1 text-xs font-medium text-primary">
              Custom bundle discount: -{formatPKR(cb.discount)}
            </p>
          )}
          <p className="mt-1 text-sm font-medium">{formatPKR(cb.price)}</p>
          <Link
            to="/bundles/build"
            onClick={() => setOpen(false)}
            className="mt-1 inline-block text-xs underline"
          >
            Edit bundle
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          magnetic={false}
          aria-label="Remove custom bundle"
          onClick={clearCustom}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
