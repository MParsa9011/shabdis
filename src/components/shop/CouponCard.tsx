"use client";

import { useState } from "react";
import { formatPrice, faNum } from "@/lib/utils";

export type CouponCardData = {
  code: string;
  description?: string | null;
  type: "PERCENT" | "FIXED";
  amount: number;
  maxDiscount?: number | null;
  minOrder?: number | null;
  scope: "ALL" | "USER" | "FIRST_ORDER";
  expiresAt?: string | null;
};

export default function CouponCard({ coupon }: { coupon: CouponCardData }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = coupon.code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const discountLabel =
    coupon.type === "PERCENT"
      ? `${faNum(coupon.amount)}٪ تخفیف`
      : `${formatPrice(coupon.amount)} تخفیف`;

  const expires = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex">
      {/* Right colored strip */}
      <div className="w-2 bg-gradient-to-b from-gold to-gold-dark shrink-0" />

      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xl font-bold text-navy">{discountLabel}</p>
            {coupon.description && <p className="text-sm text-gray-500 mt-0.5">{coupon.description}</p>}
          </div>
          {coupon.scope === "USER" ? (
            <span className="text-[11px] bg-navy/5 text-navy px-2 py-0.5 rounded-full shrink-0">مخصوص شما</span>
          ) : coupon.scope === "FIRST_ORDER" ? (
            <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full shrink-0">اولین خرید</span>
          ) : (
            <span className="text-[11px] bg-gold/10 text-gold-dark px-2 py-0.5 rounded-full shrink-0">همگانی</span>
          )}
        </div>

        {/* conditions */}
        <div className="text-xs text-gray-400 space-y-0.5 mb-4">
          {coupon.minOrder ? <p>حداقل خرید: {formatPrice(coupon.minOrder)}</p> : null}
          {coupon.type === "PERCENT" && coupon.maxDiscount ? <p>سقف تخفیف: {formatPrice(coupon.maxDiscount)}</p> : null}
          {expires ? <p>اعتبار تا: {expires}</p> : <p>بدون تاریخ انقضا</p>}
        </div>

        {/* code + copy */}
        <button
          onClick={copy}
          className="w-full flex items-center justify-between gap-2 border-2 border-dashed border-gold/50 rounded-xl px-4 py-2.5 hover:bg-gold/5 transition-colors group"
        >
          <span className="font-mono font-bold text-navy tracking-wider">{coupon.code}</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${copied ? "text-green-600" : "text-gold"}`}>
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                کپی شد
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                کپی کد
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
