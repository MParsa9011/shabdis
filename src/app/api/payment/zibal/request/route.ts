import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestPayment, getPaymentUrl } from "@/lib/zibal";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== (session.user as { id?: string }).id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/zibal/verify`;
  const result = await requestPayment(order.totalAmount, orderId, callbackUrl);

  if (result.result !== 100 || !result.trackId) {
    return NextResponse.json({ error: result.message ?? "خطا در اتصال به درگاه" }, { status: 400 });
  }

  await prisma.payment.create({
    data: { orderId, trackId: String(result.trackId), amount: order.totalAmount, status: "PENDING" },
  });

  return NextResponse.json({ paymentUrl: getPaymentUrl(String(result.trackId)) });
}
