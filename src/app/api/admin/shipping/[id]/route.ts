import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const data = await req.json();
  const method = await prisma.shippingMethod.update({ where: { id }, data });
  return NextResponse.json(method);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
