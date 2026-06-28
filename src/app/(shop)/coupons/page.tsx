import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CouponCard, { type CouponCardData } from "@/components/shop/CouponCard";

export const metadata: Metadata = {
  title: "کدهای تخفیف",
  description: "کدهای تخفیف فعال شبدیس را ببینید و در خرید خود استفاده کنید.",
};

function serialize(c: {
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  amount: number;
  maxDiscount: number | null;
  minOrder: number | null;
  scope: "ALL" | "USER" | "FIRST_ORDER";
  expiresAt: Date | null;
}): CouponCardData {
  return {
    code: c.code,
    description: c.description,
    type: c.type,
    amount: c.amount,
    maxDiscount: c.maxDiscount,
    minOrder: c.minOrder,
    scope: c.scope,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  };
}

export default async function CouponsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const now = new Date();
  const validWhere = {
    active: true,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  // Public coupons (everyone / first order)
  const publicCoupons = await prisma.coupon.findMany({
    where: { ...validWhere, scope: { in: ["ALL", "FIRST_ORDER"] } },
    orderBy: { createdAt: "desc" },
  });

  // Coupons that belong to the logged-in user
  const userCoupons = userId
    ? await prisma.coupon.findMany({
        where: { ...validWhere, scope: "USER", userId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Filter out coupons whose usage limit is exhausted
  const usable = (list: typeof publicCoupons) =>
    list.filter((c) => c.usageLimit == null || c.usedCount < c.usageLimit);

  const pub = usable(publicCoupons).map(serialize);
  const mine = usable(userCoupons).map(serialize);

  return (
    <main className="container mx-auto px-4 max-w-5xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-3">کدهای تخفیف</h1>
        <p className="text-gray-500">کد دلخواه را کپی کنید و هنگام تکمیل خرید وارد کنید.</p>
      </div>

      {/* User-specific coupons */}
      {userId ? (
        mine.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-navy rounded-full" />
              کدهای اختصاصی شما
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {mine.map((c) => <CouponCard key={c.code} coupon={c} />)}
            </div>
          </section>
        )
      ) : (
        <div className="bg-cream border border-gold/20 rounded-2xl p-6 text-center mb-12">
          <p className="text-gray-600 mb-3">برای دیدن کدهای تخفیف اختصاصی حساب خود، وارد شوید.</p>
          <Link href="/auth/signin?callbackUrl=/coupons" className="inline-block bg-navy text-white px-6 py-2.5 rounded-xl font-medium hover:bg-navy-light transition-colors">
            ورود به حساب
          </Link>
        </div>
      )}

      {/* Public coupons */}
      <section>
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gold rounded-full" />
          کدهای عمومی
        </h2>
        {pub.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {pub.map((c) => <CouponCard key={c.code} coupon={c} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>در حال حاضر کد تخفیف فعالی وجود ندارد.</p>
            <Link href="/product" className="text-gold font-medium mt-3 inline-block">مشاهده محصولات ←</Link>
          </div>
        )}
      </section>
    </main>
  );
}
