import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import DeleteMessageButton from "@/components/admin/DeleteMessageButton";

export const metadata = { title: "پیام‌های تماس | ادمین" };

export default async function AdminMessagesPage() {
  const { error } = await requireAdmin();
  if (error) redirect("/auth/signin");

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">پیام‌های تماس</h1>
        <p className="text-gray-500 mt-1">پیام‌های ارسالی از فرم تماس با ما</p>
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-400 text-center py-16">پیامی دریافت نشده است.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-navy">{m.name}{m.subject ? ` — ${m.subject}` : ""}</p>
                  <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                    {[m.phone, m.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <DeleteMessageButton id={m.id} />
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-7 whitespace-pre-line">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
