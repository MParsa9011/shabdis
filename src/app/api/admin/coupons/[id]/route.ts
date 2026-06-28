import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

type Body = {
  code: string;
  description?: string | null;
  type: "PERCENT" | "FIXED";
  amount: number;
  maxDiscount?: number | null;
  minOrder?: number | null;
  scope: "ALL" | "USER" | "FIRST_ORDER";
  userId?: string | null;
  usageLimit?: number | null;
  active?: boolean;
  expiresAt?: string | null;
};

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const b = (await req.json()) as Body;

  await prisma.coupon.update({
    where: { id },
    data: {
      code: b.code.trim(),
      description: b.description?.trim() || null,
      type: b.type,
      amount: Math.max(0, Math.floor(Number(b.amount) || 0)),
      maxDiscount: b.maxDiscount ? Math.floor(Number(b.maxDiscount)) : null,
      minOrder: b.minOrder ? Math.floor(Number(b.minOrder)) : null,
      scope: b.scope,
      userId: b.scope === "USER" ? b.userId || null : null,
      usageLimit: b.usageLimit ? Math.floor(Number(b.usageLimit)) : null,
      active: b.active ?? true,
      expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
    },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  // Detach from any orders first to satisfy the FK, then delete.
  await prisma.order.updateMany({ where: { couponId: id }, data: { couponId: null } });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
