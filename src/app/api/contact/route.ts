import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ ok: false, error: "نام و متن پیام الزامی است" }, { status: 400 });
    }
    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json({ ok: false, error: "ایمیل یا شماره تماس را وارد کنید" }, { status: 400 });
    }
    await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: String(message).trim(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطا در ارسال پیام" }, { status: 500 });
  }
}
