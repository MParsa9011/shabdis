"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "خطا در ثبت‌نام");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="تبرجین" width={140} height={50} className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-xl font-bold text-navy mt-4">ایجاد حساب کاربری</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="نام کامل"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="نام و نام خانوادگی"
            />
            <Input
              label="ایمیل"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="example@email.com"
            />
            <Input
              label="شماره موبایل (اختیاری)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="09..."
            />
            <Input
              label="رمز عبور"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="حداقل ۸ کاراکتر"
              hint="حداقل ۸ کاراکتر"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              ثبت‌نام
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/auth/signin" className="text-gold font-medium hover:text-gold-dark">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
