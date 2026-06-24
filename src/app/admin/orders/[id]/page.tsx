"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  shippingAmount: number;
  addressSnapshot: Record<string, string>;
  trackingCode: string | null;
  notes: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  items: { id: string; productName: string; variantLabel: string | null; quantity: number; price: number }[];
  shippingMethod: { name: string; price: number };
  payment: { status: string; refNumber: string | null } | null;
};

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setStatus(data.status);
        setTrackingCode(data.trackingCode ?? "");
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingCode }),
    });
    setSaving(false);
    router.refresh();
  };

  if (!order) return <div className="text-gray-400 text-sm">در حال بارگذاری...</div>;

  const address = order.addressSnapshot as Record<string, string>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">سفارش #{order.id.slice(-8).toUpperCase()}</h1>
        <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h2 className="font-semibold text-navy mb-3 text-sm">اطلاعات خریدار</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="text-gray-400">نام:</span> {order.user.name}</p>
            <p><span className="text-gray-400">ایمیل:</span> {order.user.email}</p>
            {order.user.phone && <p><span className="text-gray-400">موبایل:</span> {order.user.phone}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h2 className="font-semibold text-navy mb-3 text-sm">آدرس تحویل</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{address.fullName} — {address.phone}</p>
            <p>{address.province}، {address.city}</p>
            <p>{address.address}</p>
            <p><span className="text-gray-400">کد پستی:</span> {address.postalCode}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-6">
        <h2 className="font-semibold text-navy p-4 border-b border-gray-50 text-sm">اقلام سفارش</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs">
            <tr>
              <th className="text-right px-4 py-2 font-medium">محصول</th>
              <th className="text-right px-4 py-2 font-medium">تعداد</th>
              <th className="text-right px-4 py-2 font-medium">قیمت واحد</th>
              <th className="text-right px-4 py-2 font-medium">جمع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  <p className="font-medium text-navy">{item.productName}</p>
                  {item.variantLabel && <p className="text-xs text-gray-400">{item.variantLabel}</p>}
                </td>
                <td className="px-4 py-2 text-gray-600">{item.quantity}</td>
                <td className="px-4 py-2 text-gray-600">{formatPrice(item.price)}</td>
                <td className="px-4 py-2 font-medium">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-50 text-sm space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>هزینه ارسال ({order.shippingMethod.name})</span>
            <span>{formatPrice(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-navy">
            <span>مبلغ کل</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy text-sm">به‌روزرسانی وضعیت</h2>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">وضعیت سفارش</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold w-full max-w-xs"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
        </div>
        <div className="max-w-xs">
          <Input
            label="کد رهگیری پست"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="مثال: ۱۲۳۴۵۶۷۸"
          />
        </div>
        <Button onClick={handleSave} loading={saving}>
          ذخیره تغییرات
        </Button>
      </div>
    </div>
  );
}
