"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  duration: string;
  active: boolean;
};

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/shipping")
      .then((r) => r.json())
      .then((data) => { setMethods(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setSaving(true);
    await fetch("/api/admin/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, price: parseInt(form.price), duration: form.duration }),
    });
    setSaving(false);
    setAdding(false);
    setForm({ name: "", price: "", duration: "" });
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/shipping/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  };

  const deleteMethod = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">روش‌های ارسال</h1>
        <Button onClick={() => setAdding(!adding)} variant={adding ? "outline" : "primary"}>
          {adding ? "انصراف" : "افزودن روش ارسال"}
        </Button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 space-y-3">
          <h2 className="font-semibold text-navy text-sm">روش ارسال جدید</h2>
          <Input label="نام" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: پست پیشتاز" />
          <Input label="هزینه (تومان)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="مدت زمان" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="مثال: ۳ تا ۵ روز کاری" />
          <Button onClick={handleAdd} loading={saving}>ذخیره</Button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400 text-sm">در حال بارگذاری...</p>
        ) : methods.length === 0 ? (
          <p className="text-gray-400 text-sm">هنوز روش ارسالی تعریف نشده</p>
        ) : (
          methods.map((m) => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">{m.name}</p>
                <p className="text-sm text-gray-500">{m.duration} — {m.price === 0 ? "رایگان" : formatPrice(m.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(m.id, m.active)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${m.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {m.active ? "فعال" : "غیرفعال"}
                </button>
                <button onClick={() => deleteMethod(m.id)} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
