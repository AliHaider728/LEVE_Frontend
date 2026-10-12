import { useStoreData } from "@/store/catalog";
import { ProductCardSkeleton } from "@/components/product/ProductCard";
export function CatalogStatus() {
  const { loading, notice } = useStoreData();
  return <>
    {loading && <div role="status" className="mt-6"><p className="mb-3 text-sm text-muted-foreground">Updating store details…</p><div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{[0, 1, 2, 3].map(i => <ProductCardSkeleton key={i} />)}</div></div>}
    {notice && <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{notice}</p>}
  </>;
}
