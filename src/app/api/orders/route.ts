import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestPayment, getPaymentUrl } from "@/lib/zibal";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const body = await req.json();
  const { address, shippingMethodId, items, totalAmount, shippingAmount } = body;

  const order = await prisma.order.create({
    data: {
      userId,
      status: "PENDING",
      totalAmount,
      shippingAmount,
      addressSnapshot: address,
      shippingMethodId,
      items: {
        create: items.map((i: {
          productId: string;
          variantId?: string;
          quantity: number;
          price: number;
          productName: string;
          variantLabel?: string;
        }) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          quantity: i.quantity,
          price: i.price,
          productName: i.productName,
          variantLabel: i.variantLabel ?? null,
        })),
      },
    },
  });

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/zibal/verify`;
  const payResult = await requestPayment(totalAmount, order.id, callbackUrl);

  if (payResult.result !== 100 || !payResult.trackId) {
    return NextResponse.json({ error: payResult.message ?? "خطا در اتصال به درگاه" }, { status: 400 });
  }

  await prisma.payment.create({
    data: { orderId: order.id, trackId: String(payResult.trackId), amount: totalAmount, status: "PENDING" },
  });

  return NextResponse.json({
    orderId: order.id,
    paymentUrl: getPaymentUrl(String(payResult.trackId)),
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
      shippingMethod: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
