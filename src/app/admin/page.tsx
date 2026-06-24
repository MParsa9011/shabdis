import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد ادمین" };

export default async function AdminDashboard() {
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } }, _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { take: 1 }, user: { select: { name: true } } },
    }),
    prisma.review.count({ where: { approved: false } }),
  ]);

  const stats = [
    { label: "کل سفارش‌ها", value: totalOrders, color: "bg-blue-50 text-blue-600" },
    { label: "سفارش در انتظار", value: pendingOrders, color: "bg-yellow-50 text-yellow-600" },
    { label: "درآمد کل", value: formatPrice(totalRevenue._sum.totalAmount ?? 0), color: "bg-green-50 text-green-600" },
    { label: "محصولات", value: totalProducts, color: "bg-purple-50 text-purple-600" },
    { label: "کاربران", value: totalUsers, color: "bg-pink-50 text-pink-600" },
    { label: "دیدگاه منتظر تأیید", value: pendingReviews, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">داشبورد</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 text-lg font-bold ${s.color}`}>
              {typeof s.value === "number" ? s.value : ""}
            </div>
            <p className="text-lg font-bold text-navy">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <h2 className="font-semibold text-navy">آخرین سفارش‌ها</h2>
          <a href="/admin/orders" className="text-xs text-gold">مشاهده همه</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">کاربر</th>
                <th className="text-right px-4 py-3 font-medium">محصول</th>
                <th className="text-right px-4 py-3 font-medium">مبلغ</th>
                <th className="text-right px-4 py-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{order.user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{order.items[0]?.productName ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-navy">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
