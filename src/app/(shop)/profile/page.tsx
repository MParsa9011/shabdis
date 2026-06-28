import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پروفایل من" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id?: string }).id!;

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
        shippingMethod: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) redirect("/auth/signin");

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-8">پروفایل من</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* User info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold mb-3">
                {user.name[0]}
              </div>
              <h2 className="font-semibold text-navy">{user.name}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <div className="space-y-2 text-sm">
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">موبایل</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">عضویت از</span>
                <span className="font-medium">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">تعداد سفارش</span>
                <span className="font-medium">{orders.length}</span>
              </div>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="w-full text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-xl py-2.5 transition-colors">
              خروج از حساب
            </button>
          </form>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-navy mb-4">سفارش‌های من</h2>
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400">
              <p className="mb-3">هنوز سفارشی ثبت نکرده‌اید</p>
              <Link href="/product" className="text-gold text-sm font-medium">شروع خرید</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
                const statusColor = ORDER_STATUS_COLORS[order.status] ?? "text-gray-600 bg-gray-50";
                return (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {order.items.map((item) => (
                        <span key={item.id} className="inline-block ml-2">
                          {item.productName} × {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy">{formatPrice(order.totalAmount)}</span>
                      {order.trackingCode && (
                        <span className="text-xs text-gray-500">
                          کد رهگیری: <span className="font-mono font-medium">{order.trackingCode}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
