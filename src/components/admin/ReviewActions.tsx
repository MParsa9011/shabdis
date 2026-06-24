"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { reviewId: string; approved: boolean };

export default function ReviewActions({ reviewId, approved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    setLoading(false);
    router.refresh();
  };

  const del = async () => {
    if (!confirm("حذف شود؟")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${approved ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
      >
        {approved ? "رد کردن" : "تأیید"}
      </button>
      <button onClick={del} disabled={loading} className="text-xs text-red-400 hover:text-red-600">حذف</button>
    </div>
  );
}
