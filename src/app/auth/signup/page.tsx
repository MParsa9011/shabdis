"use client";

import { useState } from "react";
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

type Step1 = { name: string; email: string; password: string; phone: string };
type Step2 = { fullName: string; phone: string; province: string; city: string; address: string; postalCode: string };

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1>({ name: "", email: "", password: "", phone: "" });
  const [step2, setStep2] = useState<Step2>({ fullName: "", phone: "", province: "", city: "", address: "", postalCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step1.password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(step1),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "خطا در ثبت‌نام");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: step1.email, password: step1.password, redirect: false });
    setStep2((s) => ({ ...s, fullName: step1.name, phone: step1.phone }));
    setLoading(false);
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...step2, isDefault: true }),
    });
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  const handleSkip = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="شبدیس" width={140} height={50} className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-xl font-bold text-navy mt-4">
            {step === 1 ? "ایجاد حساب کاربری" : "آدرس تحویل"}
          </h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? "bg-navy text-white" : "bg-green-500 text-white"}`}>
              {step === 2 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : "۱"}
            </div>
            <div className={`w-10 h-0.5 transition-colors ${step === 2 ? "bg-green-400" : "bg-gray-200"}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? "bg-navy text-white" : "bg-gray-200 text-gray-400"}`}>
              ۲
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <Input
                label="نام کامل"
                value={step1.name}
                onChange={(e) => setStep1({ ...step1, name: e.target.value })}
                required
                placeholder="نام و نام خانوادگی"
              />
              <Input
                label="ایمیل"
                type="email"
                value={step1.email}
                onChange={(e) => setStep1({ ...step1, email: e.target.value })}
                required
                placeholder="example@email.com"
              />
              <Input
                label="شماره موبایل (اختیاری)"
                value={step1.phone}
                onChange={(e) => setStep1({ ...step1, phone: e.target.value })}
                placeholder="09..."
              />
              <Input
                label="رمز عبور"
                type="password"
                value={step1.password}
                onChange={(e) => setStep1({ ...step1, password: e.target.value })}
                required
                placeholder="حداقل ۸ کاراکتر"
                hint="حداقل ۸ کاراکتر"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                ادامه
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <p className="text-sm text-gray-500 -mt-1 mb-2">
                آدرس را وارد کنید تا در سفارش‌های بعدی سریع‌تر تکمیل شود.
              </p>
              <Input
                label="نام گیرنده"
                value={step2.fullName}
                onChange={(e) => setStep2({ ...step2, fullName: e.target.value })}
                required
                placeholder="نام کامل گیرنده"
              />
              <Input
                label="شماره تماس"
                value={step2.phone}
                onChange={(e) => setStep2({ ...step2, phone: e.target.value })}
                required
                placeholder="09..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">استان</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
                  value={step2.province}
                  onChange={(e) => setStep2({ ...step2, province: e.target.value })}
                  required
                >
                  <option value="">انتخاب استان...</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input
                label="شهر"
                value={step2.city}
                onChange={(e) => setStep2({ ...step2, city: e.target.value })}
                required
                placeholder="نام شهر"
              />
              <Input
                label="آدرس کامل"
                value={step2.address}
                onChange={(e) => setStep2({ ...step2, address: e.target.value })}
                required
                placeholder="خیابان، کوچه، پلاک..."
              />
              <Input
                label="کد پستی"
                value={step2.postalCode}
                onChange={(e) => setStep2({ ...step2, postalCode: e.target.value })}
                required
                placeholder="۱۰ رقم"
              />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={loading} className="flex-1" size="lg">
                  ذخیره و ورود
                </Button>
                <Button type="button" variant="outline" onClick={handleSkip} className="flex-1" size="lg">
                  بعداً
                </Button>
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
