"use client";
import { createFileRoute, notFound } from "@/lib/router-compat";
import { getProduct } from "@/data/products";
import { useStoreData } from "@/store/catalog";
import { CatalogStatus } from "@/components/product/CatalogStatus";
import { formatPKR } from "@/config/store";
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { QuantityAddToCart } from "@/components/product/QuantityAddToCart";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductReviews } from "@/components/product/ProductReviews";
import { BundleCard } from "@/components/product/BundleCard";
import { Badge } from "@/components/ui/badge";
import { TrustRow } from "@/components/layout/TrustRow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — LEVA Pakistan` },
      { name: "description", content: loaderData?.description ?? "LEVA skincare essential." },
      { property: "og:title", content: `${loaderData?.name ?? "Product"} — LEVA` },
      {
        property: "og:description",
        content: loaderData?.description ?? "LEVA skincare essential.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const fallback = Route.useLoaderData();
  const { products, bundles, ready } = useStoreData();
  const product = products.find(p => p.slug === fallback.slug) ?? fallback;
  const suggestions = products.filter((item) => item.slug !== product.slug);
  const matchingBundle =
    bundles.find((bundle) => bundle.productSlugs.includes(product.slug)) ?? bundles[0];
  const saving = Math.round((1 - product.price / product.compareAtPrice) * 100);
  return (
    <main className="pb-44 pt-24 md:pb-0 md:pt-28">
      <div className="px-5"><CatalogStatus /></div>
      <section className="grid min-w-0 md:grid-cols-2">
        <ProductGallery key={product.slug} product={product} />
        <div className="flex min-w-0 flex-col justify-start px-5 py-8 sm:px-8 md:px-[5vw] md:py-9">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              {product.badge === "Limited Stock" ? `Only ${product.stock} left` : product.badge}
            </Badge>
            <Badge variant="saving">Save {saving}%</Badge>
            <WishlistButton slug={product.slug} name={product.name} className="ml-auto"/>
          </div>
          <p className="eyebrow mt-5">LEVA / Essential {product.number}</p>
          <h1 className="mt-3 break-words text-4xl font-light sm:text-5xl lg:text-6xl">{product.name}</h1>
          <p className="mt-3 text-xl font-light">{product.benefit}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {product.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <strong className="text-xl font-medium">{formatPKR(product.price)}</strong>
            <span className="text-base text-muted-foreground line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
            <span className="text-sm text-muted-foreground">{product.size} · tax included</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{product.stock >= 9999 ? "In stock" : product.stock > 0 ? `In stock · ${product.stock} available` : "Currently sold out"}</p>
          <div className="mt-5">
            <QuantityAddToCart slug={product.slug} />
          </div>
          <Accordion
            type="single"
            collapsible
            className="mt-6 max-w-md border-t border-primary/20"
          >
            <AccordionItem value="ingredients">
              <AccordionTrigger>Ingredients</AccordionTrigger>
              <AccordionContent className="text-base">{product.ingredients}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>How to use</AccordionTrigger>
              <AccordionContent className="text-base">{product.usage}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq">
              <AccordionTrigger>FAQ</AccordionTrigger>
              <AccordionContent className="text-base">{product.faq}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <ProductReviews key={product.slug} productId={product.id} productName={product.name} catalogReady={ready} />
      <section className="px-6 py-16 md:px-[8vw]">
        <TrustRow />
      </section>
      {matchingBundle && (
        <section className="bg-secondary px-6 py-20 md:px-[8vw]">
          <p className="eyebrow mb-4">Frequently bought together</p>
          <h2 className="mb-12 text-5xl font-light md:text-7xl">Complete the ritual.</h2>
          <div className="max-w-xl">
            <BundleCard bundle={matchingBundle} featured />
          </div>
        </section>
      )}
      <section className="px-5 py-16 md:px-[8vw] md:py-20">
        <p className="eyebrow mb-4">Complete the ritual</p>
        <h2 className="mb-12 text-5xl font-light md:text-7xl">You may also like.</h2>
        <div className={`mx-auto grid grid-cols-2 gap-4 sm:gap-6 ${suggestions.length <= 2 ? "max-w-2xl" : suggestions.length === 3 ? "max-w-4xl md:grid-cols-3" : "max-w-6xl md:grid-cols-3 xl:grid-cols-4"}`}>
          {suggestions.map((item) => (
            <ProductCard key={item.slug} product={item.id ? item : { ...item, rating: 0, reviewCount: 0 }} />
          ))}
        </div>
      </section>
    </main>
  );
}
