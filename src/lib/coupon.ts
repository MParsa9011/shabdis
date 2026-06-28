import { prisma } from "@/lib/prisma";

export type CouponResult =
  | { valid: true; couponId: string; code: string; discount: number; type: "PERCENT" | "FIXED"; amount: number }
  | { valid: false; message: string };

/**
 * Validate a coupon code for a user against a cart subtotal and compute the discount.
 * Shared by the validate API and the order-creation flow so the rules can't be bypassed.
 */
export async function validateCoupon(
  rawCode: string,
  userId: string,
  subtotal: number
): Promise<CouponResult> {
  const code = (rawCode ?? "").trim();
  if (!code) return { valid: false, message: "کد تخفیف را وارد کنید" };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { valid: false, message: "کد تخفیف معتبر نیست" };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, message: "این کد تخفیف منقضی شده است" };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "ظرفیت استفاده از این کد به پایان رسیده است" };
  }
  if (coupon.minOrder != null && subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `حداقل مبلغ سفارش برای این کد ${coupon.minOrder.toLocaleString("fa-IR")} تومان است`,
    };
  }
  if (coupon.scope === "USER" && coupon.userId !== userId) {
    return { valid: false, message: "این کد تخفیف برای حساب شما نیست" };
  }
  if (coupon.scope === "FIRST_ORDER") {
    const paidCount = await prisma.order.count({
      where: { userId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    });
    if (paidCount > 0) {
      return { valid: false, message: "این کد فقط برای اولین خرید معتبر است" };
    }
  }

  // Compute discount
  let discount =
    coupon.type === "PERCENT"
      ? Math.floor((subtotal * coupon.amount) / 100)
      : coupon.amount;
  if (coupon.type === "PERCENT" && coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.max(0, Math.min(discount, subtotal)); // never exceed the subtotal

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    type: coupon.type,
    amount: coupon.amount,
  };
}
