import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function QuantityStepperAdd({ slug }: { slug: string }) {
  const [q, setQ] = useState(1);
  const addMany = useCart((s) => s.addMany);
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex h-12 items-center border border-primary">
        <Button
          variant="ghost"
          size="icon"
          magnetic={false}
          aria-label="Decrease quantity"
          disabled={q === 1}
          onClick={() => setQ((v) => Math.max(1, v - 1))}
        >
          <Minus />
        </Button>
        <span className="w-8 text-center text-sm" aria-live="polite">
          {q}
        </span>
        <Button
          variant="ghost"
          size="icon"
          magnetic={false}
          aria-label="Increase quantity"
          onClick={() => setQ((v) => v + 1)}
        >
          <Plus />
        </Button>
      </div>
      <Button className="h-12" onClick={() => addMany(slug, q)}>
        <ShoppingBag /> Add to cart
      </Button>
    </div>
  );
}
