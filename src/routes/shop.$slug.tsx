"use client";
import { createFileRoute, notFound } from "@/lib/router-compat";
import { getProduct, products } from "@/data/products";
import { bundles } from "@/data/bundles";
import { formatPKR } from "@/config/store";
import { QuantityAddToCart } from "@/components/product/QuantityAddToCart";
import { ProductCard } from "@/components/product/ProductCard";
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
  const product = Route.useLoaderData();
  const suggestions = products.filter((item) => item.slug !== product.slug);
  const matchingBundle =
    bundles.find((bundle) => bundle.productSlugs.includes(product.slug)) ?? bundles[0];
  const saving = Math.round((1 - product.price / product.compareAtPrice) * 100);
  return (
    <main className="pb-20 pt-24 md:pb-0 md:pt-28">
      <section className="grid md:grid-cols-2">
        <div className="grid min-h-[65vh] grid-cols-2 gap-1 bg-primary/10">
          <div className="relative col-span-2 min-h-[55vh] overflow-hidden">
            <img
              src={product.image}
              alt={`${product.name} editorial skincare view`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
          </div>
          <img
            src={product.hoverImage}
            alt={`${product.name} texture detail`}
            loading="lazy"
            className="h-64 w-full object-cover"
          />
          <img
            src={product.image}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="h-64 w-full object-cover object-right"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-14 md:px-[7vw]">
          <div className="flex flex-wrap gap-2">
            <Badge>
              {product.badge === "Limited Stock" ? `Only ${product.stock} left` : product.badge}
            </Badge>
            <Badge variant="saving">Save {saving}%</Badge>
          </div>
          <p className="eyebrow mt-8">LEVA / Essential {product.number}</p>
          <h1 className="mt-4 text-6xl font-light md:text-8xl">{product.name}</h1>
          <p className="mt-5 text-2xl font-light">{product.benefit}</p>
          <p className="mt-8 max-w-md text-base leading-8 text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <strong className="text-xl font-medium">{formatPKR(product.price)}</strong>
            <span className="text-base text-muted-foreground line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
            <span className="text-sm text-muted-foreground">{product.size} · tax included</span>
          </div>
          <div className="mt-8">
            <QuantityAddToCart slug={product.slug} />
          </div>
          <Accordion
            type="single"
            collapsible
            className="mt-10 max-w-md border-t border-primary/20"
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
      <section className="px-6 py-24 md:px-[8vw]">
        <p className="eyebrow mb-4">Complete the ritual</p>
        <h2 className="mb-12 text-5xl font-light md:text-7xl">The other movements.</h2>
        <div className="grid gap-10 md:grid-cols-2">
          {suggestions.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
