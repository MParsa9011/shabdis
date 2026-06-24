import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice, formatDate } from "@/lib/utils";
import AddToCart from "@/components/shop/AddToCart";
import ReviewForm from "@/components/shop/ReviewForm";
import StarRating from "@/components/ui/StarRating";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: { take: 1 }, metaTitle: true, metaDescription: true },
  });
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      variants: true,
      reviews: {
        where: { approved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: avgRating
      ? { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: product.reviews.length }
      : undefined,
  };

  const variantAttributes = (product.variantAttributes as string[]) ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/" className="hover:text-navy">خانه</a>
          <span>/</span>
          <a href="/products" className="hover:text-navy">محصولات</a>
          <span>/</span>
          <a href={`/categories/${product.category.slug}`} className="hover:text-navy">{product.category.name}</a>
          <span>/</span>
          <span className="text-navy">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-gray-100">
              {product.images[0] ? (
                <Image src={product.images[0].url} alt={product.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
                  </svg>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream border border-gray-100">
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover hover:opacity-80 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <a href={`/categories/${product.category.slug}`} className="text-xs text-gold hover:text-gold-dark transition-colors">
                {product.category.name}
              </a>
              {product.inStock ? (
                <Badge variant="green">موجود</Badge>
              ) : (
                <Badge variant="red">ناموجود</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-navy mb-4">{product.name}</h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating value={Math.round(avgRating)} size="sm" />
                <span className="text-sm text-gray-500">({product.reviews.length} دیدگاه)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-navy">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <Badge variant="red">
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}٪ تخفیف
                  </Badge>
                </>
              )}
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6">
              <AddToCart
                product={{
                  ...product,
                  variantAttributes,
                  variants: product.variants.map((v) => ({
                    ...v,
                    attributes: v.attributes as Record<string, string>,
                  })),
                }}
              />
            </div>

            <div className="prose prose-sm text-gray-600">
              <h3 className="font-semibold text-navy mb-2">توضیحات محصول</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-navy mb-6">دیدگاه‌های خریداران ({product.reviews.length})</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {product.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">هنوز دیدگاهی ثبت نشده. اولین نفر باشید!</p>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                          {review.user.name?.[0] ?? "؟"}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{review.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    {review.title && <p className="text-sm font-semibold text-navy mb-1">{review.title}</p>}
                    <p className="text-sm text-gray-600">{review.body}</p>
                  </div>
                ))
              )}
            </div>
            <div>
              {session?.user ? (
                <ReviewForm productId={product.id} />
              ) : (
                <div className="bg-cream border border-gray-100 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-3">برای ثبت دیدگاه ابتدا وارد شوید</p>
                  <a href="/auth/signin" className="text-gold font-medium text-sm hover:text-gold-dark">
                    ورود به حساب کاربری
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
