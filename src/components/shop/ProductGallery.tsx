"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useProductView } from "@/components/shop/ProductViewContext";

type GalleryImage = { id: string; url: string; alt?: string | null };

export default function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { activeImage } = useProductView();

  // When a variant with a specific image is selected, jump the gallery to it.
  useEffect(() => {
    if (!activeImage) return;
    const idx = images.findIndex((img) => img.url === activeImage);
    if (idx >= 0) setActiveIndex(idx);
  }, [activeImage, images]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-gray-100">
        <div className="w-full h-full flex items-center justify-center text-gray-200">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
          </svg>
        </div>
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-gray-100">
        <Image
          key={active.id}
          src={active.url}
          alt={active.alt ?? name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`تصویر ${i + 1}`}
              className={`relative aspect-square rounded-xl overflow-hidden bg-cream border-2 transition-colors ${
                i === activeIndex ? "border-gold" : "border-gray-100 hover:border-gold/40"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                className={`object-cover transition-opacity ${i === activeIndex ? "" : "opacity-80 hover:opacity-100"}`}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
