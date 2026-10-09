import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function ProductActions({ slug, inverted = false }: { slug: string; inverted?: boolean }) {
  const add = useCart((state) => state.add);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        onClick={() => add(slug)}
        className={inverted ? "bg-primary-foreground text-primary hover:bg-accent" : ""}
      >
        <ShoppingBag /> Add to cart
      </Button>
      <Button
        asChild
        variant="outline"
        className={
          inverted
            ? "border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            : ""
        }
      >
        <Link to="/shop/$slug" params={{ slug }}>
          View product{" "}
          <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </Button>
    </div>
  );
}
