import { Link } from "@/lib/router-compat";
import type { Product } from "@/data/products";
import { getPriceDisplay } from "@/lib/pricing";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsAppContact } from "@/components/product/WhatsAppContact";
import { QuantityStepperAdd } from "./QuantityStepperAdd";

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const priceInfo = getPriceDisplay(product);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden bg-background p-0">
        {product && (
          <div className="grid md:grid-cols-2">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="p-6">
              <p className="eyebrow">{product.type}</p>
              <DialogTitle className="mt-2 text-2xl font-light">{product.name}</DialogTitle>
              <DialogDescription className="mt-2 text-[15px]">{product.benefit}</DialogDescription>
              <p className="mt-4 text-xl font-medium">
                {priceInfo.formattedPrice}
                {priceInfo.hasDiscount && priceInfo.formattedCompareAtPrice && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                    {priceInfo.formattedCompareAtPrice}
                  </span>
                )}
              </p>
              <div className="mt-6">
                <QuantityStepperAdd slug={product.slug} />
              </div>
              <div className="mt-4"><WhatsAppContact product={product}/></div>
              <Button asChild variant="link" className="mt-3 px-0">
                <Link to="/shop/$slug" params={{ slug: product.slug }} onClick={onClose}>
                  View details →
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
