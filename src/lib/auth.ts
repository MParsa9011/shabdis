import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { normalizePhone } from "@/lib/otp";
import { toEnglishDigits } from "@/lib/utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "ایمیل یا شماره موبایل", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) return null;

        // Look up by email if it looks like an email, otherwise by phone.
        let user = null;
        if (identifier.includes("@")) {
          user = await prisma.user.findUnique({ where: { email: identifier } });
        } else {
          const phone = normalizePhone(identifier);
          if (phone) user = await prisma.user.findUnique({ where: { phone } });
        }
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // Login with SMS one-time code (Melipayamak)
    Credentials({
      id: "otp",
      name: "otp",
      credentials: {
        phone: { label: "شماره موبایل", type: "tel" },
        code: { label: "کد تأیید", type: "text" },
      },
      async authorize(credentials) {
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        const code = toEnglishDigits(String(credentials?.code ?? "")).trim();
        if (!phone || !code) return null;

        const record = await prisma.otpCode.findFirst({
          where: { phone, code, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!record) return null;

        // Code is valid — clear all codes for this phone (single use).
        await prisma.otpCode.deleteMany({ where: { phone } });

        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          const password = await bcrypt.hash(randomUUID(), 10);
          user = await prisma.user.create({
            data: { name: phone, phone, email: null, password },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: { strategy: "jwt" },
});
