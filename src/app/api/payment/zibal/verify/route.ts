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

  const result = await verifyPayment(trackId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (result.result === 100 && result.refNumber) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", refNumber: result.refNumber },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      }),
    ]);
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
