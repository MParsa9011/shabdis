"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // password mode
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // otp mode
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startResendTimer = () => {
    setResendIn(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1 && timerRef.current) clearInterval(timerRef.current);
        return s - 1;
      });
    }, 1000);
  };

  const finish = (res: { error?: string | null } | undefined, msg: string) => {
    if (res?.error) {
      setError(msg);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { identifier, password, redirect: false });
      finish(res, "ایمیل/شماره یا رمز عبور اشتباه است");
    } catch {
      setError("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "خطا در ارسال کد");
      } else {
        setOtpStep(2);
        startResendTimer();
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("otp", { phone, code, redirect: false });
      finish(res, "کد وارد شده نادرست یا منقضی شده است");
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "password" | "otp") => {
    setMode(m);
    setError("");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="شبدیس" width={140} height={50} className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-xl font-bold text-navy mt-4">ورود به حساب کاربری</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => switchMode("otp")}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "otp" ? "bg-white text-navy shadow-sm" : "text-gray-500"
              }`}
            >
              ورود با پیامک
            </button>
            <button
              type="button"
              onClick={() => switchMode("password")}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "password" ? "bg-white text-navy shadow-sm" : "text-gray-500"
              }`}
            >
              ورود با رمز عبور
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {mode === "password" ? (
            <form onSubmit={handlePassword} className="space-y-4">
              <Input
                label="ایمیل یا شماره موبایل"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="example@email.com یا ۰۹..."
                autoComplete="username"
              />
              <Input
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="رمز عبور خود را وارد کنید"
                autoComplete="current-password"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                ورود
              </Button>
            </form>
          ) : otpStep === 1 ? (
            <form onSubmit={sendCode} className="space-y-4">
              <Input
                label="شماره موبایل"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                autoComplete="tel"
                dir="ltr"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                ارسال کد تأیید
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <p className="text-sm text-gray-500">
                کد تأیید به شماره <span className="font-medium text-navy" dir="ltr">{phone}</span> ارسال شد.
              </p>
              <Input
                label="کد تأیید"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="کد ۵ رقمی"
                dir="ltr"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                ورود
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setOtpStep(1); setCode(""); setError(""); }}
                  className="text-gray-500 hover:text-navy"
                >
                  تغییر شماره
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0 || loading}
                  onClick={() => sendCode()}
                  className="text-gold font-medium disabled:text-gray-400"
                >
                  {resendIn > 0 ? `ارسال مجدد تا ${resendIn.toLocaleString("fa-IR")} ثانیه` : "ارسال مجدد کد"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          حساب کاربری ندارید؟{" "}
          <Link href="/auth/signup" className="text-gold font-medium hover:text-gold-dark">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
