import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ valid: false, message: "برای استفاده از کد تخفیف وارد شوید" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id!;
  const { code, subtotal } = await req.json();

  const result = await validateCoupon(String(code ?? ""), userId, Number(subtotal) || 0);
  return NextResponse.json(result);
}
