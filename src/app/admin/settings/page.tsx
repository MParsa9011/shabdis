"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

type Settings = {
  siteName: string;
  siteDescription: string;
  sitePhone: string;
  siteEmail: string;
  siteAddress: string;
  instagram: string;
  telegram: string;
  footerText: string;
  shippingCost: string;
  heroImage: string;
  heroLink: string;
  promo1Image: string;
  promo1Link: string;
  promo2Image: string;
  promo2Link: string;
  promoCoupon: string;
};

const DEFAULTS: Settings = {
  siteName: "شبدیس",
  siteDescription: "فروشگاه زیورآلات سنگ و نقره",
  sitePhone: "",
  siteEmail: "",
  siteAddress: "",
  instagram: "",
  telegram: "",
  footerText: "تمام حقوق محفوظ است.",
  shippingCost: "100000",
  heroImage: "",
  heroLink: "",
  promo1Image: "",
  promo1Link: "",
  promo2Image: "",
  promo2Link: "",
  promoCoupon: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
        setLoading(false);
      });
  }, []);

  function set(key: keyof Settings) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings((s) => ({ ...s, [key]: e.target.value }));
  }

  function handleUpload(key: keyof Settings) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setSettings((s) => ({ ...s, [key]: url }));
      }
      setUploading(false);
      e.target.value = "";
    };
  }
  const handleHeroUpload = handleUpload("heroImage");

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">تنظیمات سایت</h1>
        <p className="text-gray-500 mt-1">اطلاعات عمومی فروشگاه</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">بنر صفحه اصلی</h2>
          <p className="text-sm text-gray-500 -mt-2">تصویری که در بالای صفحه اصلی نمایش داده می‌شود. اگر خالی باشد، بنر پیش‌فرض نمایش داده می‌شود.</p>

          {settings.heroImage ? (
            <div className="relative">
              <div className="relative w-full aspect-[16/6] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image src={settings.heroImage} alt="پیش‌نمایش بنر" fill unoptimized className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, heroImage: "" }))}
                className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
              >
                حذف تصویر
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-[16/6] border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">{uploading ? "در حال آپلود..." : "انتخاب تصویر بنر"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={uploading} />
            </label>
          )}

          <Input label="آدرس تصویر (URL)" value={settings.heroImage} onChange={set("heroImage")} hint="یا مستقیم آدرس تصویر را وارد کنید" />
          <Input label="لینک مقصد بنر" value={settings.heroLink} onChange={set("heroLink")} hint="مثال: /product یا /product/my-product" placeholder="/product" />
        </div>

        {/* Promo banners */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">دو بنر تبلیغاتی (زیر صفحه اصلی)</h2>
          <p className="text-sm text-gray-500 -mt-2">دو عکس کنار هم که به صفحه دلخواه لینک می‌شوند. می‌توانید روی بنر دوم یک کد تخفیف نمایش دهید.</p>

          {([1, 2] as const).map((n) => {
            const imgKey = `promo${n}Image` as keyof Settings;
            const linkKey = `promo${n}Link` as keyof Settings;
            return (
              <div key={n} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">بنر {n === 1 ? "اول" : "دوم"}</p>
                {settings[imgKey] ? (
                  <div className="relative">
                    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <Image src={settings[imgKey]} alt="" fill unoptimized className="object-cover" />
                    </div>
                    <button type="button" onClick={() => setSettings((s) => ({ ...s, [imgKey]: "" }))} className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">حذف</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[2/1] border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors">
                    <span className="text-sm text-gray-500">{uploading ? "در حال آپلود..." : "انتخاب عکس بنر"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload(imgKey)} disabled={uploading} />
                  </label>
                )}
                <Input label="آدرس عکس (URL)" value={settings[imgKey]} onChange={set(imgKey)} />
                <Input label="لینک مقصد" value={settings[linkKey]} onChange={set(linkKey)} placeholder="/product" />
              </div>
            );
          })}

          <Input label="کد تخفیف برای نمایش روی بنر دوم (اختیاری)" value={settings.promoCoupon} onChange={set("promoCoupon")} hint="مثلاً WELCOME20 — روی بنر دوم نمایش داده می‌شود" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">اطلاعات فروشگاه</h2>
          <Input label="نام سایت" value={settings.siteName} onChange={set("siteName")} />
          <Textarea label="توضیحات سایت" value={settings.siteDescription} onChange={set("siteDescription")} rows={3} />
          <Input label="شماره تماس" value={settings.sitePhone} onChange={set("sitePhone")} />
          <Input label="ایمیل" value={settings.siteEmail} onChange={set("siteEmail")} />
          <Textarea label="آدرس" value={settings.siteAddress} onChange={set("siteAddress")} rows={2} />
          <Input label="هزینه ارسال (تومان)" type="number" value={settings.shippingCost} onChange={set("shippingCost")} hint="در صفحه قوانین و مقررات نمایش داده می‌شود" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">شبکه‌های اجتماعی</h2>
          <Input label="اینستاگرام (یوزرنیم)" value={settings.instagram} onChange={set("instagram")} hint="بدون @" />
          <Input label="تلگرام (یوزرنیم یا لینک)" value={settings.telegram} onChange={set("telegram")} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">فوتر</h2>
          <Input label="متن کپی‌رایت" value={settings.footerText} onChange={set("footerText")} />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
          {saved && <span className="text-green-600 text-sm">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}
