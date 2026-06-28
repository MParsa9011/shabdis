"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`min-w-8 h-8 px-2 rounded text-sm font-medium transition-colors ${
        active ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    }
    e.target.value = "";
  };

  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-gray-100 p-2 flex flex-wrap gap-1 bg-gray-50/50">
      <ToolButton title="ضخیم" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolButton>
      <ToolButton title="ایتالیک" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolButton>
      <ToolButton title="خط‌خورده" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolButton>
      <span className="w-px bg-gray-200 mx-1" />
      <ToolButton title="عنوان بزرگ" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
      <ToolButton title="عنوان کوچک" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
      <span className="w-px bg-gray-200 mx-1" />
      <ToolButton title="لیست نقطه‌ای" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• فهرست</ToolButton>
      <ToolButton title="لیست شماره‌ای" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>۱. فهرست</ToolButton>
      <ToolButton title="نقل‌قول" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolButton>
      <ToolButton title="خط جداکننده" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</ToolButton>
      <span className="w-px bg-gray-200 mx-1" />
      <ToolButton title="لینک" active={editor.isActive("link")} onClick={addLink}>🔗</ToolButton>
      <label title="افزودن تصویر" className="min-w-8 h-8 px-2 rounded text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer">
        🖼
        <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
      </label>
      <span className="w-px bg-gray-200 mx-1" />
      <ToolButton title="واگرد" onClick={() => editor.chain().focus().undo().run()}>↶</ToolButton>
      <ToolButton title="ازنو" onClick={() => editor.chain().focus().redo().run()}>↷</ToolButton>
    </div>
  );
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "متن را اینجا بنویسید..." }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-40 focus:outline-none p-4 text-gray-700",
        dir: "rtl",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor content in sync if the external value is reset
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-gold">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
