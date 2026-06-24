import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const { fullName, phone, province, city, address, postalCode, isDefault } = await req.json();

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const newAddress = await prisma.address.create({
    data: { userId, fullName, phone, province, city, address, postalCode, isDefault: !!isDefault },
  });

  return NextResponse.json(newAddress, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
  return NextResponse.json(addresses);
}
