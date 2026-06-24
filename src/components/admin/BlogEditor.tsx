"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import InputUI from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Props = {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    published: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
  };
};

export default function BlogEditor({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDescription ?? "");
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "محتوای مقاله را اینجا بنویسید..." }),
    ],
    content: initialData?.content ?? "",
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-64 focus:outline-none p-4 text-gray-700",
      },
    },
    immediatelyRender: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSave = async (pub?: boolean) => {
    setSaving(true);
    const isPublished = pub !== undefined ? pub : published;
    const data = {
      title, slug, excerpt, coverImage: coverImage || null,
      content: editor?.getHTML() ?? "",
      published: isPublished,
      metaTitle: metaTitle || null,
      metaDescription: metaDesc || null,
    };

    const url = isEdit ? `/api/admin/blog/${initialData!.id}` : "/api/admin/blog";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <InputUI
          label="عنوان مقاله"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!isEdit) setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase());
          }}
          placeholder="عنوان جذاب بنویسید..."
        />
        <div className="grid grid-cols-2 gap-4">
          <InputUI label="Slug (URL)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <InputUI label="تصویر کاور (URL یا آپلود)" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
        </div>
        <InputUI
          label="خلاصه (excerpt)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="خلاصه کوتاه برای لیست و SEO"
        />
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-100 p-2 flex flex-wrap gap-1">
          {[
            { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
            { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
            { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
            { label: "H3", action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }) },
            { label: "UL", action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
            { label: "OL", action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${btn.active ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {btn.label}
            </button>
          ))}
          <label className="w-8 h-8 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <EditorContent editor={editor} />
      </div>

      {/* SEO */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-navy text-sm">SEO</h2>
        <InputUI label="عنوان متا" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        <InputUI label="توضیحات متا" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => handleSave(true)} loading={saving} size="lg">
          انتشار
        </Button>
        <Button onClick={() => handleSave(false)} variant="outline" loading={saving} size="lg">
          ذخیره پیش‌نویس
        </Button>
        <Button onClick={() => router.back()} variant="ghost" size="lg">
          انصراف
        </Button>
      </div>
    </div>
  );
}
