"use client";

import { useRouter } from "next/navigation";

export default function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const remove = async () => {
    if (!confirm("این پیام حذف شود؟")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return (
    <button onClick={remove} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
  );
}
