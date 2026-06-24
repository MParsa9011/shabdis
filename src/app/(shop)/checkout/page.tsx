"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(3, "نام کامل الزامی است"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  province: z.string().min(2, "استان الزامی است"),
  city: z.string().min(2, "شهر الزامی است"),
  address: z.string().min(10, "آدرس کامل وارد کنید"),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی ۱۰ رقمی وارد کنید"),
  shippingMethodId: z.string().min(1, "روش ارسال را انتخاب کنید"),
});

type Form = z.infer<typeof schema>;

type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  duration: string;
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const selectedShippingId = watch("shippingMethodId");
  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingId);

  useEffect(() => {
    fetch("/api/shipping").then((r) => r.json()).then(setShippingMethods);
  }, []);

  const grandTotal = total() + (selectedShipping?.price ?? 0);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: {
          fullName: data.fullName,
          phone: data.phone,
          province: data.province,
          city: data.city,
          address: data.address,
          postalCode: data.postalCode,
        },
        shippingMethodId: data.shippingMethodId,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          productName: i.name,
          variantLabel: i.variantLabel,
        })),
        totalAmount: grandTotal,
        shippingAmount: selectedShipping?.price ?? 0,
      }),
    });
    const { orderId, paymentUrl } = await res.json();
    if (paymentUrl) window.location.href = paymentUrl;
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-lg py-20 text-center">
        <p className="text-gray-500 mb-4">سبد خرید شما خالی است</p>
        <a href="/products" className="text-gold font-medium">بازگشت به فروشگاه</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-8">تکمیل سفارش</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs">۱</span>
              آدرس تحویل
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="نام و نام خانوادگی" {...register("fullName")} error={errors.fullName?.message} />
              </div>
              <Input label="شماره موبایل" {...register("phone")} error={errors.phone?.message} placeholder="09..." />
              <Input label="کد پستی" {...register("postalCode")} error={errors.postalCode?.message} />
              <Input label="استان" {...register("province")} error={errors.province?.message} />
              <Input label="شهر" {...register("city")} error={errors.city?.message} />
              <div className="col-span-2">
                <Input label="آدرس کامل" {...register("address")} error={errors.address?.message} />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs">۲</span>
              روش ارسال
            </h2>
            {errors.shippingMethodId && <p className="text-xs text-red-600 mb-3">{errors.shippingMethodId.message}</p>}
            <div className="space-y-2">
              {shippingMethods.length === 0 && <p className="text-gray-400 text-sm">در حال بارگذاری...</p>}
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedShippingId === method.id
                      ? "border-navy bg-navy/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={method.id}
                      {...register("shippingMethodId")}
                      className="accent-navy"
                    />
                    <div>
                      <p className="text-sm font-medium text-navy">{method.name}</p>
                      <p className="text-xs text-gray-400">{method.duration}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-navy">
                    {method.price === 0 ? "رایگان" : formatPrice(method.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-navy mb-4">خلاصه سفارش</h2>
          <div className="space-y-2 mb-4 text-sm">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-gray-600">
                <span className="truncate ml-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600">
              <span>جمع سبد</span>
              <span>{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>هزینه ارسال</span>
              <span>{selectedShipping ? (selectedShipping.price === 0 ? "رایگان" : formatPrice(selectedShipping.price)) : "---"}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-navy mb-6">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
          <Button type="submit" loading={loading} size="lg" className="w-full">
            پرداخت آنلاین
          </Button>
          <p className="text-xs text-gray-400 text-center mt-3">درگاه پرداخت امن زیبال</p>
        </div>
      </form>
    </div>
  );
}
