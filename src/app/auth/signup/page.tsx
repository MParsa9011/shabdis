"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const PROVINCES = [
  "آذربایجان شرقی","آذربایجان غربی","اردبیل","اصفهان","البرز","ایلام","بوشهر",
  "تهران","چهارمحال و بختیاری","خراسان جنوبی","خراسان رضوی","خراسان شمالی",
  "خوزستان","زنجان","سمنان","سیستان و بلوچستان","فارس","قزوین","قم","کردستان",
  "کرمان","کرمانشاه","کهگیلویه و بویراحمد","گلستان","گیلان","لرستان","مازندران",
  "مرکزی","هرمزگان","همدان","یزد",
];

type Account = { name: string; email: string; password: string; phone: string };
type Address = { fullName: string; phone: string; province: string; city: string; address: string; postalCode: string };

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [account, setAccount] = useState<Account>({ name: "", email: "", password: "", phone: "" });
  const [code, setCode] = useState("");
  const [addr, setAddr] = useState<Address>({ fullName: "", phone: "", province: "", city: "", address: "", postalCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startResend = () => {
    setResendIn(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1 && timerRef.current) clearInterval(timerRef.current);
        return s - 1;
      });
    }, 1000);
  };

  // Step 1: account info → send verification code to phone
  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (account.password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: account.phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "خطا در ارسال کد تأیید");
      } else {
        setStep(2);
        startResend();
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify code → create account → sign in
  const verifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...account, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }
      await signIn("credentials", { identifier: account.phone, password: account.password, redirect: false });
      setAddr((s) => ({ ...s, fullName: account.name, phone: account.phone }));
      setStep(3);
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: account.phone }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) setError(data.error ?? "خطا در ارسال مجدد");
    else startResend();
  };

  // Step 3: save address
  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addr, isDefault: true }),
    });
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  const finishLater = () => { router.push("/"); router.refresh(); };

  const titles = { 1: "ایجاد حساب کاربری", 2: "تأیید شماره موبایل", 3: "آدرس تحویل" };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="شبدیس" width={140} height={50} className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-xl font-bold text-navy mt-4">{titles[step]}</h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > n ? "bg-green-500 text-white" : step === n ? "bg-navy text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {step > n ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : n.toLocaleString("fa-IR")}
                </div>
                {i < 2 && <div className={`w-8 h-0.5 transition-colors ${step > n ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={submitAccount} className="space-y-4">
              <Input
                label="نام کامل"
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
                required
                placeholder="نام و نام خانوادگی"
              />
              <Input
                label="شماره موبایل"
                type="tel"
                dir="ltr"
                value={account.phone}
                onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                required
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              />
              <Input
                label="ایمیل (اختیاری)"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder="example@email.com"
              />
              <Input
                label="رمز عبور"
                type="password"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                required
                placeholder="حداقل ۸ کاراکتر"
                hint="حداقل ۸ کاراکتر"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                دریافت کد تأیید
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyAndRegister} className="space-y-4">
              <p className="text-sm text-gray-500">
                کد تأیید به شماره <span className="font-medium text-navy" dir="ltr">{account.phone}</span> پیامک شد.
              </p>
              <Input
                label="کد تأیید"
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="کد ۵ رقمی"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                تأیید و ادامه
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep(1); setCode(""); setError(""); }} className="text-gray-500 hover:text-navy">
                  ویرایش اطلاعات
                </button>
                <button type="button" disabled={resendIn > 0} onClick={resend} className="text-gold font-medium disabled:text-gray-400">
                  {resendIn > 0 ? `ارسال مجدد تا ${resendIn.toLocaleString("fa-IR")} ثانیه` : "ارسال مجدد کد"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={saveAddress} className="space-y-4">
              <p className="text-sm text-gray-500 -mt-1 mb-2">
                آدرس را وارد کنید تا در سفارش‌های بعدی سریع‌تر تکمیل شود.
              </p>
              <Input label="نام گیرنده" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required placeholder="نام کامل گیرنده" />
              <Input label="شماره تماس" dir="ltr" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} required placeholder="۰۹..." />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">استان</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
                  value={addr.province}
                  onChange={(e) => setAddr({ ...addr, province: e.target.value })}
                  required
                >
                  <option value="">انتخاب استان...</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input label="شهر" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required placeholder="نام شهر" />
              <Input label="آدرس کامل" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} required placeholder="خیابان، کوچه، پلاک..." />
              <Input label="کد پستی" dir="ltr" value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} required placeholder="۱۰ رقم" />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={loading} className="flex-1" size="lg">ذخیره و ورود</Button>
                <Button type="button" variant="outline" onClick={finishLater} className="flex-1" size="lg">بعداً</Button>
              </div>
            </form>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/auth/signin" className="text-gold font-medium hover:text-gold-dark">
              وارد شوید
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
