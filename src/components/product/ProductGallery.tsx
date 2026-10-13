"use client";

import { useState } from "react";
import type { Product } from "@/data/products";

export function ProductGallery({ product }: { product: Product }) {
  const images = Array.from(new Set((product.galleryImages?.length ? product.galleryImages : [product.image, product.hoverImage]).filter(Boolean)));
  const [selected, setSelected] = useState(0);
  const active = images[Math.min(selected, images.length - 1)] ?? product.image;
  const wideImage = /\/leva-ritual-hero\.png(?:\?|$)/i.test(active);

  return <div className="min-w-0 bg-primary/5">
    <div className={`relative overflow-hidden bg-secondary/60 ${wideImage ? "h-[min(78vw,22rem)] md:h-[min(46vw,34rem)]" : "h-[min(110vw,34rem)] md:h-[min(52vw,40rem)]"}`}>
      <img src={active} alt={product.name} className="h-full w-full object-contain p-5 md:p-8" loading="eager" />
    </div>
    {images.length > 1 && <div className="flex gap-2 border-t border-primary/10 p-3" aria-label={product.name + " image gallery"}>
      {images.map((source, index) => <button type="button" key={source} aria-label={`Show image ${index + 1} of ${product.name}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`size-16 overflow-hidden rounded-md border-2 bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 ${selected === index ? "border-primary" : "border-transparent"}`}>
        <img src={source} alt="" loading="lazy" className="size-full object-contain" />
      </button>)}
    </div>}
  </div>;
}
