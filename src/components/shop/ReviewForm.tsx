"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import StarRating from "@/components/ui/StarRating";

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10, "دیدگاه باید حداقل ۱۰ کاراکتر باشد"),
});

type Form = z.infer<typeof schema>;

export default function ReviewForm({ productId }: { productId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const onSubmit = async (data: Form) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, productId }),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-700 font-medium">دیدگاه شما با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود.</p>
      </div>
    );
  }

  return (
    <div className="bg-cream border border-gray-100 rounded-xl p-6">
      <h3 className="font-semibold text-navy mb-4">ثبت دیدگاه</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">امتیاز</label>
          <StarRating
            value={rating}
            onChange={(v) => { setRating(v); setValue("rating", v); }}
          />
          {errors.rating && <p className="text-xs text-red-600 mt-1">لطفاً امتیاز بدهید</p>}
        </div>
        <Input label="عنوان دیدگاه (اختیاری)" {...register("title")} placeholder="خلاصه نظر شما" />
        <Textarea
          label="متن دیدگاه"
          {...register("body")}
          error={errors.body?.message}
          placeholder="تجربه خود از این محصول را بنویسید..."
          rows={4}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          ثبت دیدگاه
        </Button>
      </form>
    </div>
  );
}
