"use client";

import { useState } from "react";
import type { Product } from "@/data/products";

export function ProductGallery({ product }: { product: Product }) {
  const images = Array.from(new Set((product.galleryImages?.length ? product.galleryImages : [product.image, product.hoverImage]).filter(Boolean)));
  const [selected, setSelected] = useState(0);
  const active = images[Math.min(selected, images.length - 1)] ?? product.image;
  // Keep the main frame stable as a different image is selected.
  const wideImage = /\/leva-ritual-hero\.png(?:\?|$)/i.test(product.image);

  return <div className="flex min-w-0 flex-col bg-primary/5 md:flex-row-reverse md:items-start">
    <div className={`relative min-w-0 flex-1 overflow-hidden bg-secondary/60 ${wideImage ? "h-[min(78vw,22rem)] md:h-[min(46vw,34rem)]" : "h-[min(110vw,34rem)] md:h-[min(52vw,40rem)]"}`}>
      <img src={active} alt={product.name} className="h-full w-full object-contain p-5 md:p-8" loading="eager" />
    </div>
    {images.length > 1 && <div data-product-thumbnails className="flex w-full gap-2 overflow-x-auto border-t border-primary/10 p-3 md:max-h-[40rem] md:w-20 md:shrink-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:border-r md:border-t-0 md:p-2" aria-label={product.name + " image gallery"}>
      {images.map((source, index) => <button type="button" key={source} aria-label={`Show image ${index + 1} of ${product.name}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`size-16 shrink-0 overflow-hidden rounded-md border-2 bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 ${selected === index ? "border-primary" : "border-transparent"}`}>
        <img src={source} alt="" loading="lazy" className="size-full object-contain" />
      </button>)}
    </div>}
  </div>;
}
