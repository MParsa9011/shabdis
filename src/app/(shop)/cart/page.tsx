"use client";

import { useCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-3xl py-20 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 5h12" />
        </svg>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">سبد خرید شما خالی است</h1>
        <p className="text-gray-400 text-sm mb-6">محصولات مورد علاقه خود را پیدا کنید</p>
        <Link href="/product">
          <Button>مشاهده محصولات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-8">سبد خرید</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4">
              <Link href={`/product/${item.slug}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-cream" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-navy hover:text-gold transition-colors line-clamp-2">
                  {item.name}
                </Link>
                {item.variantLabel && <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-navy transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-navy transition-colors disabled:opacity-40"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-red-400 hover:text-red-600 transition-colors mr-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <span className="font-bold text-navy text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">
            پاک کردن سبد خرید
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-navy mb-4">خلاصه سفارش</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={`sum-${item.productId}-${item.variantId}`} className="flex justify-between text-sm text-gray-600">
                <span className="truncate ml-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between font-bold text-navy">
              <span>جمع کل</span>
              <span>{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">هزینه ارسال در مرحله بعد محاسبه می‌شود</p>
          </div>
          <Link href="/checkout">
            <Button className="w-full" size="lg">
              ادامه و ثبت سفارش
            </Button>
          </Link>
          <Link href="/product" className="block text-center text-sm text-gold mt-3 hover:text-gold-dark transition-colors">
            ادامه خرید
          </Link>
        </div>
      </div>
    </div>
  );
}
