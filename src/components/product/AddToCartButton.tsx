import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function AddToCartButton({ slug }: { slug: string }) {
  const addMany = useCart((state) => state.addMany);
  return (
    <Button onClick={() => addMany(slug, 1)} size="lg" className="h-12 px-7">
      <ShoppingBag /> Add to cart
    </Button>
  );
}
