import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/otp";
import { toEnglishDigits } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { name, email, password, phone: rawPhone, code } = await req.json();

  const phone = normalizePhone(String(rawPhone ?? ""));
  if (!name || !phone || !password) {
    return NextResponse.json({ error: "نام، شماره موبایل و رمز عبور الزامی است" }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "رمز عبور باید حداقل ۸ کاراکتر باشد" }, { status: 400 });
  }

  // Verify the SMS code for this phone
  const cleanCode = toEnglishDigits(String(code ?? "")).trim();
  const record = await prisma.otpCode.findFirst({
    where: { phone, code: cleanCode, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) {
    return NextResponse.json({ error: "کد تأیید نادرست یا منقضی شده است" }, { status: 400 });
  }

  // Uniqueness
  if (await prisma.user.findUnique({ where: { phone } })) {
    return NextResponse.json({ error: "این شماره موبایل قبلاً ثبت شده است" }, { status: 409 });
  }
  const cleanEmail = String(email ?? "").trim() || null;
  if (cleanEmail && (await prisma.user.findUnique({ where: { email: cleanEmail } }))) {
    return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(String(password), 12);
  const user = await prisma.user.create({
    data: { name, phone, email: cleanEmail, password: hashed },
    select: { id: true, name: true, email: true, phone: true },
  });

  await prisma.otpCode.deleteMany({ where: { phone } });

  return NextResponse.json(user, { status: 201 });
}
