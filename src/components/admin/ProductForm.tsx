"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { cartesian } from "@/lib/utils";
import Image from "next/image";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    categoryId: string;
    inStock: boolean;
    featured: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    images: { id: string; url: string }[];
    variantAttributes: string[];
    variants: { id: string; attributes: Record<string, string>; price?: number | null; stock: number; sku?: string | null }[];
  };
};

type VariantRow = {
  id?: string;
  attributes: Record<string, string>;
  price: string;
  stock: string;
  sku: string;
};

export default function ProductForm({ categories, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [comparePrice, setComparePrice] = useState(String(initialData?.comparePrice ?? ""));
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [inStock, setInStock] = useState(initialData?.inStock ?? true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDescription ?? "");

  const [attrNames, setAttrNames] = useState<string[]>(initialData?.variantAttributes ?? []);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes,
      price: String(v.price ?? ""),
      stock: String(v.stock),
      sku: v.sku ?? "",
    })) ?? []
  );
  const [images, setImages] = useState<{ id?: string; url: string }[]>(initialData?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const generateVariants = () => {
    const arrays = attrNames.map((n) =>
      (attrValues[n] ?? "").split(",").map((v) => v.trim()).filter(Boolean)
    );
    if (arrays.some((a) => a.length === 0)) return;
    const combos = cartesian(arrays);
    setVariants(
      combos.map((combo) => ({
        attributes: Object.fromEntries(attrNames.map((n, i) => [n, combo[i]])),
        price: "",
        stock: "0",
        sku: "",
      }))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setImages((prev) => [...prev, { url }]);
      }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const data = {
      name, slug, description,
      price: parseInt(price),
      comparePrice: comparePrice ? parseInt(comparePrice) : null,
      categoryId, inStock, featured,
      metaTitle: metaTitle || null,
      metaDescription: metaDesc || null,
      images: images.map((img, i) => ({ ...img, order: i })),
      variantAttributes: attrNames,
      variants: variants.map((v) => ({
        id: v.id,
        attributes: v.attributes,
        price: v.price ? parseInt(v.price) : null,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || null,
      })),
    };

    const url = isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "خطا در ذخیره");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">اطلاعات پایه</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="نام محصول" value={name} onChange={(e) => {
              setName(e.target.value);
              if (!isEdit) setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase());
            }} />
          </div>
          <Input label="Slug (URL)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">دسته‌بندی</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Textarea label="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">قیمت</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="قیمت (تومان)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="قیمت اصلی / قبل از تخفیف (اختیاری)" type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-navy" />
            <span className="text-sm">موجود است</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-gold" />
            <span className="text-sm">محصول ویژه</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">تصاویر</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group">
              <Image src={img.url} alt="" fill className="object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">{uploading ? "..." : "افزودن"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">ویژگی‌ها و انواع محصول</h2>
        <div className="space-y-3">
          {attrNames.map((name, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Input
                label={i === 0 ? "نام ویژگی" : ""}
                value={name}
                onChange={(e) => {
                  const updated = [...attrNames];
                  updated[i] = e.target.value;
                  setAttrNames(updated);
                }}
                placeholder="مثال: سایز"
                className="w-32"
              />
              <Input
                label={i === 0 ? "مقادیر (با کاما جدا کنید)" : ""}
                value={attrValues[name] ?? ""}
                onChange={(e) => setAttrValues({ ...attrValues, [name]: e.target.value })}
                placeholder="مثال: 16, 18, 20"
                className="flex-1"
              />
              <button onClick={() => {
                setAttrNames((prev) => prev.filter((_, j) => j !== i));
              }} className="text-red-400 hover:text-red-600 pb-2">✕</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setAttrNames((prev) => [...prev, ""])}
              className="text-sm text-gold hover:text-gold-dark"
            >
              + افزودن ویژگی
            </button>
            {attrNames.length > 0 && (
              <button
                onClick={generateVariants}
                className="text-sm bg-navy text-white px-3 py-1 rounded-lg hover:bg-navy-light transition-colors"
              >
                تولید خودکار ترکیب‌ها
              </button>
            )}
          </div>
        </div>

        {variants.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  {attrNames.map((n) => <th key={n} className="text-right px-3 py-2 font-medium border border-gray-100">{n}</th>)}
                  <th className="text-right px-3 py-2 font-medium border border-gray-100">قیمت (اختیاری)</th>
                  <th className="text-right px-3 py-2 font-medium border border-gray-100">موجودی *</th>
                  <th className="text-right px-3 py-2 font-medium border border-gray-100">SKU</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border border-gray-100">
                    {attrNames.map((n) => (
                      <td key={n} className="px-3 py-1.5 border border-gray-50 text-gray-700">{v.attributes[n]}</td>
                    ))}
                    <td className="border border-gray-50 p-1">
                      <input type="number" value={v.price} onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], price: e.target.value };
                        setVariants(updated);
                      }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-gold" />
                    </td>
                    <td className="border border-gray-50 p-1">
                      <input type="number" value={v.stock} onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], stock: e.target.value };
                        setVariants(updated);
                      }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-gold" />
                    </td>
                    <td className="border border-gray-50 p-1">
                      <input value={v.sku} onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], sku: e.target.value };
                        setVariants(updated);
                      }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-gold" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">SEO (اختیاری)</h2>
        <Input label="عنوان متا" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="عنوان برای موتورهای جستجو" />
        <Textarea label="توضیحات متا" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} placeholder="توضیح کوتاه ۱۵۰-۱۶۰ کاراکتری" />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving} size="lg">
          {isEdit ? "ذخیره تغییرات" : "افزودن محصول"}
        </Button>
        <Button variant="outline" onClick={() => router.back()} size="lg">
          انصراف
        </Button>
      </div>
    </div>
  );
}
