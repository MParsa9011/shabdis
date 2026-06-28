"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";

type SliderProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: { url: string; alt?: string | null }[];
  categories: { name: string }[];
  reviews: { rating: number }[];
  inStock: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  accentColor: "navy" | "gold";
  products: SliderProduct[];
  viewAllHref: string;
  autoPlay?: boolean;
  interval?: number;
};

export default function ProductSlider({
  title,
  subtitle,
  accentColor,
  products,
  viewAllHref,
  autoPlay = true,
  interval = 3500,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [paused, setPaused] = useState(false);

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const offset = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(offset > 4);
    setCanNext(offset < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    return () => el.removeEventListener("scroll", updateButtons);
  }, [updateButtons]);

  const scroll = useCallback((dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const step = (el.firstElementChild?.clientWidth ?? 220) + 16; // gap-4 = 1rem
    const amount = step * 2;
    // In RTL, scrolling "forward" (next) decreases scrollLeft.
    const delta = (rtl ? -1 : 1) * (dir === "next" ? 1 : -1) * amount;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  // Auto-advance with loop back to start
  useEffect(() => {
    if (!autoPlay || paused || products.length <= 2) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const offset = Math.abs(el.scrollLeft);
      const max = el.scrollWidth - el.clientWidth;
      if (offset >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("next");
      }
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, paused, interval, products.length, scroll]);

  const accentBg = accentColor === "navy" ? "bg-navy" : "bg-gold";
  const accentText = accentColor === "navy" ? "text-navy" : "text-gold";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-7 ${accentBg} rounded-full`} />
          <div>
            <h2 className="text-xl font-bold text-navy">{title}</h2>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("prev")}
            disabled={!canPrev}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="قبلی"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("next")}
            disabled={!canNext}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="بعدی"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Link href={viewAllHref} className={`text-sm font-medium ${accentText} hover:opacity-75 transition-opacity mr-1`}>
            همه ←
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-[46vw] sm:w-56 lg:w-64">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
