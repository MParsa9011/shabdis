import Image from "next/image";
import Link from "next/link";
import { formatPrice, faNum } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: { url: string; alt?: string | null }[];
    categories: { name: string }[];
    inStock: boolean;
    reviews?: { rating: number }[];
  };
};

export default function ProductCard({ product }: Props) {
  const image = product.images[0];
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gold/30 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-cream overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-gold-pale">
              <svg className="w-16 h-16 text-gold/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
          )}
          {discount && (
            <div className="absolute top-2 right-2">
              <Badge variant="red">{faNum(discount)}٪ تخفیف</Badge>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Badge variant="gray">ناموجود</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-1">{product.categories[0]?.name ?? ""}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-navy transition-colors">
            {product.name}
          </h3>

          {avgRating && (
            <div className="flex items-center gap-1 mb-2">
              <svg className="w-3.5 h-3.5 text-gold fill-gold" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-gray-500">{avgRating.toFixed(1)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <span className="text-sm font-bold text-navy">{formatPrice(product.price)}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                )}
              </>
            ) : (
              <span className="text-sm font-bold text-red-500">ناموجود</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
