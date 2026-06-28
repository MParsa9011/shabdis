"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  _count?: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parentId: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", slug: "", parentId: "", image: "" });
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || "", image: cat.image || "" });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setForm((f) => ({ ...f, image: url }));
    }
    setUploading(false);
    e.target.value = "";
  }

  function generateSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9؀-ۿ-]/g, "");
  }

  async function handleSave() {
    setSaving(true);
    const body = { ...form, parentId: form.parentId || null, image: form.image || null };
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`دسته‌بندی "${name}" حذف شود؟`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">دسته‌بندی‌ها</h1>
          <p className="text-gray-500 mt-1">مدیریت دسته‌بندی محصولات</p>
        </div>
        <Button variant="primary" onClick={openNew}>+ دسته‌بندی جدید</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">نام</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">اسلاگ</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">والد</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">محصولات</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {cat.parentId ? categories.find((c) => c.id === cat.parentId)?.name || "—" : "اصلی"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{cat._count?.products ?? 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="text-navy hover:underline text-sm">ویرایش</button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500 hover:underline text-sm">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">هنوز دسته‌بندی‌ای ثبت نشده</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}>
        <div className="space-y-4">
          <Input
            label="نام دسته‌بندی"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: editing ? f.slug : generateSlug(name) }));
            }}
          />
          <Input
            label="اسلاگ (URL)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            hint="مثال: rings یا انگشتر"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عکس دسته‌بندی</label>
            {form.image ? (
              <div className="relative w-full aspect-square max-w-[180px] rounded-xl overflow-hidden border border-gray-200">
                <Image src={form.image} alt="" fill unoptimized className="object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))} className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600">حذف</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-square max-w-[180px] border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors text-gray-400">
                <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">{uploading ? "در حال آپلود..." : "انتخاب عکس"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی والد (اختیاری)</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            >
              <option value="">— بدون والد (دسته اصلی) —</option>
              {rootCategories
                .filter((c) => c.id !== editing?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.name || !form.slug} className="flex-1">
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">انصراف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
