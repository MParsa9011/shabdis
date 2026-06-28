"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { NavCategory } from "@/lib/categories";

type Props = {
  categories: NavCategory[];
  active?: boolean;
  label?: string;
  href?: string;
};

export default function CategoryMenu({ categories, active, label = "دسته‌بندی", href = "/categories" }: Props) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // No categories → fall back to a plain link
  if (categories.length === 0) {
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors hover:text-gold ${active ? "text-gold" : "text-gray-700"}`}
      >
        {label}
      </Link>
    );
  }

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    setActiveId((id) => id ?? categories[0].id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const activeCat = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <Link
        href={href}
        className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold ${
          open || active ? "text-gold" : "text-gray-700"
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {open && (
        <div className="absolute top-full right-0 pt-3 z-50">
          <div className="flex bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[480px]">
            {/* Parent categories */}
            <div className="w-48 bg-gray-50/70 py-2 shrink-0">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onMouseEnter={() => setActiveId(cat.id)}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    activeId === cat.id
                      ? "bg-white text-gold font-semibold"
                      : "text-gray-700 hover:text-gold"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.children.length > 0 && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>

            {/* Subcategories of the active parent */}
            <div className="flex-1 p-5">
              <div className="flex items-center justify-between mb-4">
                <Link href={`/categories/${activeCat.slug}`} className="text-base font-bold text-navy hover:text-gold transition-colors">
                  {activeCat.name}
                </Link>
                <Link href={`/categories/${activeCat.slug}`} className="text-xs text-gold hover:text-gold-dark transition-colors">
                  مشاهده همه ←
                </Link>
              </div>

              {activeCat.children.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {activeCat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      className="flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-gold transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold/50" />
                      {sub.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">زیردسته‌ای وجود ندارد</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
