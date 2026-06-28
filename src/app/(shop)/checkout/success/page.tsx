"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/store/cart";
import Link from "next/link";
import Button from "@/components/ui/Button";

function SuccessContent() {
  const { clearCart } = useCart();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const trackId = params.get("trackId");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 max-w-lg py-20 text-center">
      <div className="bg-white border border-green-100 rounded-3xl p-10 shadow-sm">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-navy mb-3">پرداخت موفق!</h1>
        <p className="text-gray-500 mb-6">
          سفارش شما با موفقیت ثبت شد و در اسرع وقت ارسال خواهد شد.
        </p>
        {trackId && (
          <div className="bg-gray-50 rounded-xl p-3 mb-6 text-sm">
            <span className="text-gray-500">کد پیگیری پرداخت: </span>
            <span className="font-mono font-semibold text-navy">{trackId}</span>
          </div>
        )}
        {orderId && (
          <div className="bg-gray-50 rounded-xl p-3 mb-6 text-sm">
            <span className="text-gray-500">شماره سفارش: </span>
            <span className="font-mono font-semibold text-navy">{orderId}</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link href="/profile/orders">
            <Button className="w-full">مشاهده سفارش‌های من</Button>
          </Link>
          <Link href="/product">
            <Button variant="outline" className="w-full">ادامه خرید</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
