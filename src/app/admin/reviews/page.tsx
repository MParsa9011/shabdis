import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import ReviewActions from "@/components/admin/ReviewActions";
import StarRating from "@/components/ui/StarRating";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدیریت دیدگاه‌ها" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">دیدگاه‌ها</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-orange-600 mb-3 text-sm">در انتظار تأیید ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((review) => (
              <div key={review.id} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm text-navy">{review.user.name}</span>
                    <span className="text-gray-400 text-xs mr-2">درباره: {review.product.name}</span>
                  </div>
                  <ReviewActions reviewId={review.id} approved={review.approved} />
                </div>
                <StarRating value={review.rating} size="sm" />
                {review.title && <p className="text-sm font-medium mt-1">{review.title}</p>}
                <p className="text-sm text-gray-600 mt-1">{review.body}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-gray-600 mb-3 text-sm">تأیید شده ({approved.length})</h2>
        <div className="space-y-2">
          {approved.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-medium text-sm text-navy">{review.user.name}</span>
                  <span className="text-gray-400 text-xs mr-2">درباره: {review.product.name}</span>
                </div>
                <ReviewActions reviewId={review.id} approved={review.approved} />
              </div>
              <StarRating value={review.rating} size="sm" />
              {review.title && <p className="text-sm font-medium mt-1">{review.title}</p>}
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
