import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zibal";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  if (!trackId || !orderId || success !== "1") {
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", process.env.NEXT_PUBLIC_SITE_URL!));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Guard against double processing (e.g. callback hit twice) so stock is
  // only decremented once per order.
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!existing) {
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", siteUrl));
  }
  if (existing.status !== "PENDING") {
    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${orderId}&trackId=${trackId}`, siteUrl)
    );
  }

  const result = await verifyPayment(trackId);

  if (result.result === 100 && result.refNumber) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", refNumber: result.refNumber },
      });
      const paidOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        select: { couponId: true },
      });

      // Count the coupon usage once the order is actually paid.
      if (paidOrder.couponId) {
        await tx.coupon.update({
          where: { id: paidOrder.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Decrement stock for each ordered variant, and mark a product as
      // out of stock once all of its variants are depleted.
      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, variantId: true, quantity: true },
      });

      const affectedProductIds = new Set<string>();
      for (const item of items) {
        affectedProductIds.add(item.productId);
        if (!item.variantId) continue;
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });
        if (!variant) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: Math.max(0, variant.stock - item.quantity) },
        });
      }

      for (const productId of affectedProductIds) {
        const variants = await tx.productVariant.findMany({
          where: { productId },
          select: { stock: true },
        });
        if (variants.length > 0 && variants.every((v) => v.stock <= 0)) {
          await tx.product.update({ where: { id: productId }, data: { inStock: false } });
        }
      }
    });

    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${orderId}&trackId=${trackId}`, siteUrl)
    );
  }

  await prisma.payment.update({
    where: { orderId },
    data: { status: "FAILED" },
  });

  return NextResponse.redirect(new URL(`/checkout?error=verify_failed&orderId=${orderId}`, siteUrl));
}
