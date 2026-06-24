"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  user?: { name?: string | null; role?: string } | null;
};

export default function Header({ user }: Props) {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/products", label: "محصولات" },
    { href: "/categories", label: "دسته‌بندی" },
    { href: "/blog", label: "بلاگ" },
    { href: "/about", label: "درباره ما" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="تبرجین" width={120} height={40} className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  pathname === link.href ? "text-gold" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link href="/products" className="p-2 text-gray-600 hover:text-gold transition-colors hidden md:block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 5h12M7 13l-2-5M17 18a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              {count() > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count()}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.[0] ?? "ک"}
                  </div>
                  <span className="hidden lg:block">{user.name}</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="hidden md:block text-xs bg-gold text-white px-2 py-1 rounded-md font-medium">
                    پنل ادمین
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ورود
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-gold-pale text-gold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-2 py-2 text-sm text-navy">
                  پروفایل من
                </Link>
              ) : (
                <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="block px-2 py-2 text-sm text-navy">
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
