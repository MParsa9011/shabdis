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

type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const selectedShippingId = watch("shippingMethodId");
  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingId);

  const applyAddress = (a: SavedAddress) => {
    setSelectedAddressId(a.id);
    setValue("fullName", a.fullName, { shouldValidate: true });
    setValue("phone", a.phone, { shouldValidate: true });
    setValue("province", a.province, { shouldValidate: true });
    setValue("city", a.city, { shouldValidate: true });
    setValue("address", a.address, { shouldValidate: true });
    setValue("postalCode", a.postalCode, { shouldValidate: true });
  };

  useEffect(() => {
    fetch("/api/shipping").then((r) => r.json()).then(setShippingMethods);
  }, []);

  // Load saved addresses and pre-fill the form with the default one.
  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SavedAddress[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setSavedAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        applyAddress(def);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = total();
  const discount = coupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal - discount) + (selectedShipping?.price ?? 0);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    setCouponError("");
    const res = await fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), subtotal }),
    });
    const data = await res.json();
    setCouponApplying(false);
    if (data.valid) {
      setCoupon({ code: data.code, discount: data.discount });
      setCouponError("");
    } else {
      setCoupon(null);
      setCouponError(data.message ?? "کد تخفیف معتبر نیست");
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

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
        totalAmount: subtotal + (selectedShipping?.price ?? 0),
        shippingAmount: selectedShipping?.price ?? 0,
        couponCode: coupon?.code ?? null,
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
        <a href="/product" className="text-gold font-medium">بازگشت به فروشگاه</a>
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

            {savedAddresses.length > 0 && (
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-2">آدرس‌های ذخیره‌شده</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyAddress(a)}
                      className={`text-right p-3 rounded-xl border transition-all ${
                        selectedAddressId === a.id
                          ? "border-navy bg-navy/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-navy">{a.fullName}</span>
                        {a.isDefault && (
                          <span className="text-[10px] bg-gold/10 text-gold-dark px-2 py-0.5 rounded-full">پیش‌فرض</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{a.province}، {a.city}، {a.address}</p>
                      <p className="text-xs text-gray-400 mt-1">{a.phone} · {a.postalCode}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">می‌توانید یکی را انتخاب کنید یا فیلدهای زیر را ویرایش کنید.</p>
              </div>
            )}

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
          {/* Coupon */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <div className="text-sm">
                  <span className="font-mono font-bold text-green-700">{coupon.code}</span>
                  <span className="text-green-600 text-xs mr-2">اعمال شد</span>
                </div>
                <button type="button" onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="کد تخفیف"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplying || !couponInput.trim()}
                    className="bg-navy text-white text-sm px-4 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-40"
                  >
                    {couponApplying ? "..." : "اعمال"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600">
              <span>جمع سبد</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>تخفیف</span>
                <span>− {formatPrice(discount)}</span>
              </div>
            )}
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
