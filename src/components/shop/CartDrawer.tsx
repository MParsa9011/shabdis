"use client";

import { useCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-navy text-lg">سبد خرید</h2>
            {count() > 0 && (
              <span className="bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count()}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <svg className="w-16 h-16 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 5h12" />
              </svg>
              <p className="text-gray-400 text-sm">سبد خرید شما خالی است</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={closeCart}>
                <Link href="/product">مشاهده محصولات</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-cream" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-navy"
                  >
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-sm text-gray-600 hover:border-navy hover:text-navy transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-sm text-gray-600 hover:border-navy hover:text-navy transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-navy shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">جمع کل</span>
              <span className="font-bold text-navy text-base">{formatPrice(total())}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full" size="lg">
                ادامه و پرداخت
              </Button>
            </Link>
            <Link href="/cart" onClick={closeCart}>
              <Button variant="outline" className="w-full" size="md">
                مشاهده سبد خرید
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
