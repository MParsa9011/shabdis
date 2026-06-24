import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const methods = await prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });
  return NextResponse.json(methods);
}
