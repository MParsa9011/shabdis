"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import RichEditor from "@/components/admin/RichEditor";
import { cartesian } from "@/lib/utils";
import Image from "next/image";

type Category = { id: string; name: string; parentId?: string | null };

type Props = {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription?: string | null;
    price: number;
    comparePrice?: number | null;
    categoryIds: string[];
    inStock: boolean;
    featured: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    images: { id: string; url: string; alt?: string | null }[];
    variantAttributes: string[];
    variants: { id: string; attributes: Record<string, string>; price?: number | null; stock: number; sku?: string | null; image?: string | null }[];
  };
};

type VariantRow = {
  id?: string;
  attributes: Record<string, string>;
  price: string;
  stock: string;
  sku: string;
  image: string;
};

export default function ProductForm({ categories, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [longDescription, setLongDescription] = useState(initialData?.longDescription ?? "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [comparePrice, setComparePrice] = useState(String(initialData?.comparePrice ?? ""));
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData?.categoryIds ?? []);
  const [inStock, setInStock] = useState(initialData?.inStock ?? true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDescription ?? "");

  const [attrNames, setAttrNames] = useState<string[]>(initialData?.variantAttributes ?? []);
  // Reconstruct attribute values from existing variants so they re-appear when editing.
  const [attrValues, setAttrValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const names = initialData?.variantAttributes ?? [];
    const vars = initialData?.variants ?? [];
    for (const n of names) {
      const vals = Array.from(new Set(vars.map((v) => v.attributes[n]).filter(Boolean)));
      if (vals.length) map[n] = vals.join("، ");
    }
    return map;
  });
  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes,
      price: String(v.price ?? ""),
      stock: String(v.stock),
      sku: v.sku ?? "",
      image: v.image ?? "",
    })) ?? []
  );
  const [images, setImages] = useState<{ id?: string; url: string; alt?: string | null }[]>(
    initialData?.images ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Build variant rows from the attribute names + values.
  // Splits on both English (,) and Persian (،) commas, and preserves the
  // price/stock/sku of any existing variant whose combination still matches.
  const buildVariants = (): VariantRow[] => {
    const names = attrNames.map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return [];
    const arrays = names.map((n) =>
      (attrValues[n] ?? "").split(/[,،]/).map((v) => v.trim()).filter(Boolean)
    );
    // If any attribute has no values yet, keep the current variants untouched.
    if (arrays.some((a) => a.length === 0)) return variants;
    const combos = cartesian(arrays);
    return combos.map((combo) => {
      const attributes = Object.fromEntries(names.map((n, i) => [n, combo[i]]));
      const existing = variants.find((v) => names.every((n) => v.attributes[n] === attributes[n]));
      return existing ?? { attributes, price: "", stock: "0", sku: "", image: "" };
    });
  };

  const generateVariants = () => setVariants(buildVariants());

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setImages((prev) => [...prev, { url, alt: "" }]);
      }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    // Auto-build variants from the entered attribute values so the user doesn't
    // have to remember to click "تولید خودکار ترکیب‌ها" before saving.
    const finalNames = attrNames.map((n) => n.trim()).filter(Boolean);
    const finalVariants = buildVariants();
    if (finalVariants !== variants) setVariants(finalVariants);
    const data = {
      name, slug, description,
      longDescription: longDescription || null,
      price: parseInt(price),
      comparePrice: comparePrice ? parseInt(comparePrice) : null,
      categoryIds, inStock, featured,
      metaTitle: metaTitle || null,
      metaDescription: metaDesc || null,
      images: images.map((img, i) => ({ url: img.url, alt: img.alt || null, order: i })),
      variantAttributes: finalNames,
      variants: finalVariants.map((v) => ({
        id: v.id,
        attributes: v.attributes,
        price: v.price ? parseInt(v.price) : null,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || null,
        image: v.image || null,
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
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              دسته‌بندی‌ها <span className="text-gray-400 font-normal">(می‌توانید چند مورد انتخاب کنید)</span>
            </label>
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              {categories.map((c) => {
                const checked = categoryIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                      checked
                        ? "bg-gold/10 border-gold text-gold-dark"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gold/40"
                    } ${c.parentId ? "mr-3" : "font-medium"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setCategoryIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                        )
                      }
                      className="accent-gold"
                    />
                    {c.parentId ? `↳ ${c.name}` : c.name}
                  </label>
                );
              })}
              {categories.length === 0 && (
                <span className="text-sm text-gray-400">دسته‌بندی‌ای وجود ندارد</span>
              )}
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">توضیح کوتاه</label>
            <RichEditor value={description} onChange={setDescription} placeholder="توضیح کوتاه محصول..." />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">توضیح کامل (بلند)</label>
            <RichEditor value={longDescription} onChange={setLongDescription} placeholder="توضیحات کامل، مشخصات، جزئیات محصول..." />
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
        <p className="text-xs text-gray-400 -mt-2">برای هر تصویر، متن جایگزین (alt) برای سئو و دسترس‌پذیری وارد کنید.</p>
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
              </div>
              <input
                value={img.alt ?? ""}
                onChange={(e) =>
                  setImages((prev) => prev.map((im, j) => (j === i ? { ...im, alt: e.target.value } : im)))
                }
                placeholder="متن جایگزین تصویر (alt)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 p-2 shrink-0"
                title="حذف تصویر"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-4 cursor-pointer hover:border-gold transition-colors text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">{uploading ? "در حال آپلود..." : "افزودن تصویر"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">ویژگی‌ها و انواع محصول</h2>
        <p className="text-xs text-gray-400 -mt-2">
          نام ویژگی (مثل «سایز») و مقادیرش را با کاما وارد کنید. لازم نیست حتماً دکمه تولید را بزنید؛ هنگام ذخیره به‌صورت خودکار ساخته می‌شوند.
        </p>
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
                  <th className="text-right px-3 py-2 font-medium border border-gray-100">تصویر</th>
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
                    <td className="border border-gray-50 p-1">
                      {images.length === 0 ? (
                        <span className="text-xs text-gray-300">اول عکس اضافه کنید</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {v.image && (
                            <div className="relative w-7 h-7 rounded overflow-hidden border border-gray-200 shrink-0">
                              <Image src={v.image} alt="" fill className="object-cover" />
                            </div>
                          )}
                          <select
                            value={v.image}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[i] = { ...updated[i], image: e.target.value };
                              setVariants(updated);
                            }}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-gold"
                          >
                            <option value="">—</option>
                            {images.map((img, idx) => (
                              <option key={img.url} value={img.url}>عکس {(idx + 1).toLocaleString("fa-IR")}</option>
                            ))}
                          </select>
                        </div>
                      )}
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
