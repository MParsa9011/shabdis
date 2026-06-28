import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/otp";
import { sendOtp } from "@/lib/melipayamak";

export async function POST(req: NextRequest) {
  try {
    const { phone: raw } = await req.json();
    const phone = normalizePhone(String(raw ?? ""));
    if (!phone) {
      return NextResponse.json({ ok: false, error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }

    // Rate limit: one code per 60 seconds per number
    const recent = await prisma.otpCode.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (recent) {
      return NextResponse.json({ ok: false, error: "تا ۶۰ ثانیه دیگر دوباره تلاش کنید" }, { status: 429 });
    }

    // Melipayamak generates and sends the code, returning it to us to store.
    const code = await sendOtp(phone);
    if (!code) {
      return NextResponse.json({ ok: false, error: "خطا در ارسال پیامک" }, { status: 502 });
    }

    await prisma.otpCode.deleteMany({ where: { phone } });
    await prisma.otpCode.create({
      data: { phone, code, expiresAt: new Date(Date.now() + 2 * 60_000) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
