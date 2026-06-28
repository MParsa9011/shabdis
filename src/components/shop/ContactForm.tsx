"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } else {
      const d = await res.json();
      setError(d.error ?? "خطا در ارسال پیام");
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-navy mb-1">پیام شما ارسال شد</h3>
        <p className="text-gray-500 text-sm">در اسرع وقت با شما تماس می‌گیریم.</p>
        <button onClick={() => setDone(false)} className="text-gold text-sm font-medium mt-4">ارسال پیام جدید</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="نام و نام خانوادگی" value={form.name} onChange={set("name")} required placeholder="نام شما" />
        <Input label="شماره تماس" value={form.phone} onChange={set("phone")} placeholder="09..." />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="ایمیل" type="email" value={form.email} onChange={set("email")} placeholder="example@email.com" />
        <Input label="موضوع" value={form.subject} onChange={set("subject")} placeholder="موضوع پیام" />
      </div>
      <Textarea label="متن پیام" value={form.message} onChange={set("message")} rows={5} required placeholder="پیام خود را بنویسید..." />
      <Button type="submit" loading={loading} size="lg" className="w-full">ارسال پیام</Button>
    </form>
  );
}
