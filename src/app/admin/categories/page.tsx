"use client";
import { useState, useEffect } from "react";
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
  const [form, setForm] = useState({ name: "", slug: "", parentId: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", slug: "", parentId: "" });
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || "" });
    setShowModal(true);
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
    const body = { ...form, parentId: form.parentId || null };
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
