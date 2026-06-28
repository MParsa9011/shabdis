"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatPrice, faNum } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  type: "PERCENT" | "FIXED";
  amount: number;
  maxDiscount?: number | null;
  minOrder?: number | null;
  scope: "ALL" | "USER" | "FIRST_ORDER";
  userId?: string | null;
  user?: { name: string; email: string } | null;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: string | null;
  _count?: { orders: number };
};

type UserLite = { id: string; name: string; email: string };

const SCOPE_LABEL: Record<string, string> = {
  ALL: "همگانی",
  USER: "کاربر خاص",
  FIRST_ORDER: "اولین خرید",
};

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  amount: "",
  maxDiscount: "",
  minOrder: "",
  scope: "ALL" as "ALL" | "USER" | "FIRST_ORDER",
  userId: "",
  usageLimit: "",
  active: true,
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/admin/coupons").then((r) => r.json()).then((d) => { setCoupons(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => {
    load();
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : []));
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(""); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description ?? "",
      type: c.type,
      amount: String(c.amount),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      minOrder: c.minOrder ? String(c.minOrder) : "",
      scope: c.scope,
      userId: c.userId ?? "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setEditingId(c.id);
    setError("");
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code.trim()) { setError("کد الزامی است"); return; }
    if (form.scope === "USER" && !form.userId) { setError("برای کوپن کاربر خاص، کاربر را انتخاب کنید"); return; }
    setSaving(true);
    setError("");
    const payload = {
      code: form.code,
      description: form.description,
      type: form.type,
      amount: Number(form.amount),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      minOrder: form.minOrder ? Number(form.minOrder) : null,
      scope: form.scope,
      userId: form.userId || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      active: form.active,
      expiresAt: form.expiresAt || null,
    };
    const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "خطا در ذخیره"); return; }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("این کد تخفیف حذف شود؟")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">کدهای تخفیف</h1>
          <p className="text-gray-500 mt-1">ساخت و مدیریت کوپن‌های تخفیف</p>
        </div>
        <Button onClick={openCreate}>+ کد جدید</Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-16">در حال بارگذاری...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-400 text-center py-16">هنوز کدی ثبت نشده است</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">کد</th>
                <th className="text-right px-4 py-3 font-medium">مقدار</th>
                <th className="text-right px-4 py-3 font-medium">نوع</th>
                <th className="text-right px-4 py-3 font-medium">استفاده</th>
                <th className="text-right px-4 py-3 font-medium">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-navy">{c.code}</span>
                      {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.type === "PERCENT" ? `${faNum(c.amount)}٪` : formatPrice(c.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {SCOPE_LABEL[c.scope]}{c.scope === "USER" && c.user ? `: ${c.user.name}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {faNum(c.usedCount)}{c.usageLimit ? ` / ${faNum(c.usageLimit)}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      {!c.active ? (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">غیرفعال</span>
                      ) : expired ? (
                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">منقضی</span>
                      ) : (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">فعال</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="text-navy hover:text-gold text-xs ml-3">ویرایش</button>
                      <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-navy mb-4">{editingId ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}</h2>
            {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="کد" value={form.code} onChange={set("code")} placeholder="مثال: WELCOME20" />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">نوع تخفیف</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
                    <option value="PERCENT">درصدی</option>
                    <option value="FIXED">مبلغ ثابت</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label={form.type === "PERCENT" ? "درصد (۱ تا ۱۰۰)" : "مبلغ (تومان)"} type="number" value={form.amount} onChange={set("amount")} />
                {form.type === "PERCENT" && (
                  <Input label="سقف تخفیف (اختیاری)" type="number" value={form.maxDiscount} onChange={set("maxDiscount")} hint="تومان" />
                )}
              </div>
              <Input label="حداقل مبلغ سفارش (اختیاری)" type="number" value={form.minOrder} onChange={set("minOrder")} hint="تومان" />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">محدوده استفاده</label>
                <select value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as "ALL" | "USER" | "FIRST_ORDER" }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
                  <option value="ALL">همگانی (همه کاربران)</option>
                  <option value="USER">کاربر خاص</option>
                  <option value="FIRST_ORDER">فقط اولین خرید</option>
                </select>
              </div>
              {form.scope === "USER" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">کاربر</label>
                  <select value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
                    <option value="">انتخاب کاربر...</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="سقف تعداد استفاده (اختیاری)" type="number" value={form.usageLimit} onChange={set("usageLimit")} />
                <Input label="تاریخ انقضا (اختیاری)" type="date" value={form.expiresAt} onChange={set("expiresAt")} />
              </div>
              <Input label="توضیحات (اختیاری)" value={form.description} onChange={set("description")} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-navy" />
                <span className="text-sm">فعال باشد</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={save} loading={saving} className="flex-1">{editingId ? "ذخیره تغییرات" : "ساخت کد"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">انصراف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
