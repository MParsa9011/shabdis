import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "آمار و گزارش | ادمین" };

function BreakdownCard({
  title,
  rows,
  color,
}: {
  title: string;
  rows: { label: string; count: number }[];
  color: string;
}) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h3 className="font-medium text-navy mb-4 text-sm">{title}</h3>
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">داده‌ای نیست</p>
        )}
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
          return (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 truncate ml-2">{r.label}</span>
                <span className="text-gray-400 shrink-0">{r.count.toLocaleString("fa-IR")} ({pct}٪)</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const { error } = await requireAdmin();
  if (error) redirect("/auth/signin");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  const [
    productStats,
    categoryStats,
    topProducts,
    ordersByStatus,
    monthlySales,
    totalRevenue,
    stockWarning,
    totalViews,
    todayViews,
    yesterdayViews,
    weekViews,
    dailyViews,
    topPages,
  ] = await Promise.all([
    // Product overview
    prisma.product.aggregate({
      _count: { _all: true },
      _avg: { price: true },
      _max: { price: true },
      _min: { price: true },
    }),

    // Products per category
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
    }),

    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      _count: { _all: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),

    // Monthly sales (last 6 months)
    prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { createdAt: true, totalAmount: true },
    }),

    // Total revenue
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { totalAmount: true },
      _count: { _all: true },
      _avg: { totalAmount: true },
    }),

    // Low stock products
    prisma.productVariant.findMany({
      where: { stock: { lte: 5, gt: 0 } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    // Visit stats
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
    // Daily views last 7 days
    prisma.pageView.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true },
    }),
    // Top pages
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
  ]);

  // Breakdown stats for visits (device / browser / source / location)
  const [deviceStats, browserStats, sourceStats, countryStats] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["device"],
      _count: { _all: true },
      orderBy: { _count: { device: "desc" } },
    }),
    prisma.pageView.groupBy({
      by: ["browser"],
      _count: { _all: true },
      orderBy: { _count: { browser: "desc" } },
    }),
    prisma.pageView.groupBy({
      by: ["source"],
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 8,
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 8,
    }),
  ]);

  // Unique visitors (distinct visitorId) per period
  const countUnique = async (createdAt?: { gte?: Date; lt?: Date }) =>
    (
      await prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { visitorId: { not: null }, ...(createdAt ? { createdAt } : {}) },
      })
    ).length;

  const [uniqueTotal, uniqueToday, uniqueYesterday, uniqueWeek] = await Promise.all([
    countUnique(),
    countUnique({ gte: todayStart }),
    countUnique({ gte: yesterdayStart, lt: todayStart }),
    countUnique({ gte: weekStart }),
  ]);

  // Process monthly sales
  const monthlyMap: Record<string, { revenue: number; count: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = { revenue: 0, count: 0 };
  }
  for (const order of monthlySales) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += order.totalAmount;
      monthlyMap[key].count += 1;
    }
  }
  const monthlyData = Object.entries(monthlyMap);
  const maxRevenue = Math.max(...monthlyData.map(([, v]) => v.revenue), 1);

  const statusLabels: Record<string, string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    PROCESSING: "در حال آماده‌سازی",
    SHIPPED: "ارسال شده",
    DELIVERED: "تحویل داده شده",
    CANCELLED: "لغو شده",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const inStockCount = await prisma.product.count({ where: { inStock: true } });
  const outOfStockCount = await prisma.product.count({ where: { inStock: false } });

  // Build daily views map for last 7 days
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86400000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    dailyMap[key] = 0;
  }
  for (const view of dailyViews) {
    const d = new Date(view.createdAt);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyChartData = Object.entries(dailyMap);
  const maxDailyViews = Math.max(...dailyChartData.map(([, v]) => v), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">آمار و گزارش</h1>
        <p className="text-gray-500 mt-1">نمای کلی عملکرد فروشگاه</p>
      </div>

      {/* Visit stats */}
      <div>
        <h2 className="text-lg font-semibold text-navy mb-4">آمار بازدید</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">امروز</p>
            <p className="text-2xl font-bold text-navy">{uniqueToday.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-gray-400 mt-1">بازدیدکننده یکتا · {todayViews.toLocaleString("fa-IR")} بازدید</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">دیروز</p>
            <p className="text-2xl font-bold text-navy">{uniqueYesterday.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-gray-400 mt-1">بازدیدکننده یکتا · {yesterdayViews.toLocaleString("fa-IR")} بازدید</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">۷ روز اخیر</p>
            <p className="text-2xl font-bold text-navy">{uniqueWeek.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-gray-400 mt-1">بازدیدکننده یکتا · {weekViews.toLocaleString("fa-IR")} بازدید</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">کل</p>
            <p className="text-2xl font-bold text-navy">{uniqueTotal.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-gray-400 mt-1">بازدیدکننده یکتا · {totalViews.toLocaleString("fa-IR")} بازدید</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-medium text-navy mb-4 text-sm">بازدید روزانه (۷ روز اخیر)</h3>
            <div className="flex items-end gap-2 h-28">
              {dailyChartData.map(([day, count]) => {
                const height = maxDailyViews > 0 ? Math.max((count / maxDailyViews) * 100, count > 0 ? 4 : 0) : 0;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[10px] text-gray-400">{count > 0 ? count : ""}</p>
                    <div className="w-full flex items-end justify-center h-20">
                      <div
                        className="w-full rounded-t-md bg-gold/70 hover:bg-gold transition-colors"
                        style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">{day}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-medium text-navy mb-4 text-sm">پربازدیدترین صفحات</h3>
            <div className="space-y-2">
              {topPages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">هنوز بازدیدی ثبت نشده</p>
              )}
              {topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate font-mono">{p.path || "/"}</p>
                  </div>
                  <span className="text-xs font-semibold text-navy shrink-0">{p._count._all.toLocaleString("fa-IR")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device / Browser / Source / Location breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <BreakdownCard
            title="دستگاه"
            rows={deviceStats.map((d) => ({ label: d.device ?? "نامشخص", count: d._count._all }))}
            color="bg-navy/70"
          />
          <BreakdownCard
            title="مرورگر"
            rows={browserStats.map((b) => ({ label: b.browser ?? "نامشخص", count: b._count._all }))}
            color="bg-gold/70"
          />
          <BreakdownCard
            title="منبع ورود"
            rows={sourceStats.map((s) => ({ label: s.source ?? "نامشخص", count: s._count._all }))}
            color="bg-blue-400"
          />
          <BreakdownCard
            title="کشور / موقعیت"
            rows={countryStats.map((c) => ({ label: c.country ?? "نامشخص", count: c._count._all }))}
            color="bg-green-400"
          />
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-navy to-navy-light text-white rounded-xl p-5">
          <p className="text-white/60 text-sm mb-1">درآمد کل</p>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue._sum.totalAmount ?? 0)}</p>
          <p className="text-white/50 text-xs mt-1">{totalRevenue._count._all} سفارش موفق</p>
        </div>
        <div className="bg-gradient-to-br from-gold to-gold-dark text-white rounded-xl p-5">
          <p className="text-white/70 text-sm mb-1">میانگین سبد خرید</p>
          <p className="text-2xl font-bold">{formatPrice(Math.round(totalRevenue._avg.totalAmount ?? 0))}</p>
          <p className="text-white/60 text-xs mt-1">به ازای هر سفارش</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">محصولات</p>
          <p className="text-2xl font-bold text-navy">{productStats._count._all}</p>
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-green-600">{inStockCount} موجود</span>
            {" · "}
            <span className="text-red-500">{outOfStockCount} ناموجود</span>
          </p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-navy mb-6">فروش ماهانه (۶ ماه اخیر)</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(([key, val]) => {
            const height = maxRevenue > 0 ? Math.max((val.revenue / maxRevenue) * 100, val.revenue > 0 ? 4 : 0) : 0;
            const [year, month] = key.split("-");
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("fa-IR", { month: "short" });
            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-400 text-center">{formatPrice(val.revenue)}</p>
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-full rounded-t-lg bg-navy/80 hover:bg-navy transition-colors"
                    style={{ height: `${height}%`, minHeight: val.revenue > 0 ? "4px" : "0" }}
                    title={`${val.count} سفارش`}
                  />
                </div>
                <p className="text-xs text-gray-500">{monthName}</p>
                <p className="text-xs text-gray-300">{val.count} سفارش</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-navy mb-4">وضعیت سفارش‌ها</h2>
          <div className="space-y-3">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[s.status] ?? s.status}
                  </span>
                </div>
                <div className="text-left text-sm">
                  <span className="font-semibold text-navy">{s._count._all}</span>
                  <span className="text-gray-400 text-xs mr-1">سفارش</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products per category */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-navy mb-4">محصولات به تفکیک دسته</h2>
          <div className="space-y-3">
            {categoryStats.map((cat) => {
              const pct = productStats._count._all > 0
                ? Math.round((cat._count.products / productStats._count._all) * 100)
                : 0;
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-400">{cat._count.products} محصول ({pct}٪)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top selling products */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-semibold text-navy">پرفروش‌ترین محصولات</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3 font-medium">#</th>
              <th className="text-right px-4 py-3 font-medium">محصول</th>
              <th className="text-right px-4 py-3 font-medium">تعداد فروش</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{p.productName}</td>
                <td className="px-4 py-3">
                  <span className="text-navy font-bold">{p._sum.quantity}</span>
                  <span className="text-gray-400 text-xs mr-1">عدد</span>
                </td>
              </tr>
            ))}
            {topProducts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">هنوز فروشی ثبت نشده</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Low stock warning */}
      {stockWarning.length > 0 && (
        <div className="bg-white border border-orange-100 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-orange-50 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="font-semibold text-orange-700">موجودی رو به اتمام</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-orange-50/50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">محصول</th>
                <th className="text-right px-4 py-3 font-medium">ویژگی</th>
                <th className="text-right px-4 py-3 font-medium">موجودی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stockWarning.map((v) => (
                <tr key={v.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{v.product.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {v.attributes
                      ? Object.entries(v.attributes as Record<string, string>).map(([k, val]) => `${k}: ${val}`).join(" | ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${v.stock <= 2 ? "text-red-500" : "text-orange-500"}`}>
                      {v.stock} عدد
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
