import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "کاربران | ادمین شبدیس" };

export default async function AdminUsersPage() {
  const { error } = await requireAdmin();
  if (error) redirect("/auth/signin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">کاربران</h1>
        <p className="text-gray-500 mt-1">{users.length} کاربر ثبت‌نام کرده</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">نام</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">ایمیل</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">تلفن</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">نقش</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">سفارش‌ها</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">تاریخ ثبت</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600 direction-ltr text-left">{user.email}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{user.phone || "—"}</td>
                <td className="py-3 px-4">
                  <Badge variant={user.role === "ADMIN" ? "navy" : "gray"}>
                    {user.role === "ADMIN" ? "ادمین" : "مشتری"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{user._count.orders}</td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">هنوز کاربری ثبت‌نام نکرده</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
