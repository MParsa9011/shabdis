import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const methods = await prisma.shippingMethod.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { name, price, duration } = await req.json();
  const method = await prisma.shippingMethod.create({ data: { name, price, duration } });
  return NextResponse.json(method, { status: 201 });
}
