"use client";
import { useState, useEffect } from "react";
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
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">اطلاعات فروشگاه</h2>
          <Input label="نام سایت" value={settings.siteName} onChange={set("siteName")} />
          <Textarea label="توضیحات سایت" value={settings.siteDescription} onChange={set("siteDescription")} rows={3} />
          <Input label="شماره تماس" value={settings.sitePhone} onChange={set("sitePhone")} />
          <Input label="ایمیل" value={settings.siteEmail} onChange={set("siteEmail")} />
          <Textarea label="آدرس" value={settings.siteAddress} onChange={set("siteAddress")} rows={2} />
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
