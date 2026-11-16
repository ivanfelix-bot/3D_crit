"use client";

import { useState } from "react";
import { ProductPhoto } from "./ProductPhoto";

/** Galleria foto con miniature, utilizzabile anche con il pollice da telefono. */
export function Gallery({ images, alt }: { images: { url: string; alt: string }[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-paper">
        <ProductPhoto src={current?.url} alt={current?.alt || alt} sizes="(min-width: 1024px) 50vw, 100vw" priority />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-paper transition-colors ${
                i === active ? "border-navy" : "border-transparent"
              }`}
            >
              <ProductPhoto src={img.url} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
