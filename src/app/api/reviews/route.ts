import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const { productId, rating, title, body } = await req.json();

  if (!productId || !rating || !body) {
    return NextResponse.json({ error: "داده‌های ناقص" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({ where: { userId, productId } });
  if (existing) {
    return NextResponse.json({ error: "قبلاً دیدگاه ثبت کرده‌اید" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { userId, productId, rating, title: title || null, body, approved: false },
  });

  return NextResponse.json(review, { status: 201 });
}
