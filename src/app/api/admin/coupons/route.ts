import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const coupons = await prisma.coupon.findMany({
    include: { user: { select: { name: true, email: true } }, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

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

function normalize(b: Body) {
  return {
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
  };
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = (await req.json()) as Body;
  if (!body.code?.trim()) return NextResponse.json({ error: "کد الزامی است" }, { status: 400 });

  const exists = await prisma.coupon.findUnique({ where: { code: body.code.trim() } });
  if (exists) return NextResponse.json({ error: "این کد قبلاً ثبت شده است" }, { status: 400 });

  const coupon = await prisma.coupon.create({ data: normalize(body) });
  return NextResponse.json(coupon, { status: 201 });
}
