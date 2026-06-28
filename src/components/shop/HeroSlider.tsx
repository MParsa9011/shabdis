"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, faNum } from "@/lib/utils";

type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  description: string;
  images: { url: string }[];
};

export default function HeroSlider({
  products,
  interval = 5000,
}: {
  products: HeroProduct[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  const next = useCallback(() => setIndex((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setIndex((p) => (p - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [paused, count, interval, next]);

  if (count === 0) return null;

  return (
    <section
      className="relative bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {/* Decorative blurs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gold-light blur-2xl" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="relative">
          {(() => {
            const p = products[index];
            const disc =
              p.comparePrice && p.comparePrice > p.price
                ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                : null;
            return (
              <div key={p.id} style={{ animation: "heroFade 0.6s ease" }}>
                <div className="grid md:grid-cols-2 gap-8 items-center py-10 md:py-14">
                  {/* Image */}
                  <div className="flex justify-center">
                    <Link
                      href={`/product/${p.slug}`}
                      className="relative w-56 h-56 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl"
                    >
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 224px, 320px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy" />
                      )}
                    </Link>
                  </div>

                  {/* Text */}
                  <div className="text-center md:text-right">
                    <span className="inline-flex items-center gap-1.5 bg-gold/20 text-gold-light border border-gold/30 rounded-full px-4 py-1.5 text-sm mb-5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      محصول ویژه
                    </span>
                    <h2 className="text-xl md:text-3xl font-bold leading-tight mb-4">{p.name}</h2>
                    <p className="text-gray-300 leading-8 mb-6 line-clamp-2 max-w-lg mx-auto md:mx-0">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                      <span className="text-2xl md:text-3xl font-bold text-gold">{formatPrice(p.price)}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <>
                          <span className="text-gray-400 line-through">{formatPrice(p.comparePrice)}</span>
                          {disc && (
                            <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                              {faNum(disc)}٪
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <Link
                      href={`/product/${p.slug}`}
                      className="inline-block bg-gold text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
                    >
                      مشاهده محصول
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="قبلی"
                className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="بعدی"
                className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-2 pb-6 -mt-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`اسلاید ${faNum(i + 1)}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
