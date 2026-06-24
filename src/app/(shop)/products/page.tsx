import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import SortSelect from "@/components/shop/SortSelect";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "محصولات",
  description: "همه زیورآلات سنگ و نقره شبدیس. انگشتر، دستبند، گردنبند، گوشواره.",
};

type SearchParams = Promise<{
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  q?: string;
  page?: string;
}>;

const PER_PAGE = 20;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { category, sort = "newest", min, max, q, page = "1" } = params;
  const pageNum = Math.max(1, parseInt(page));
  const skip = (pageNum - 1) * PER_PAGE;

  const where: Record<string, unknown> = { inStock: true };
  if (category) where.category = { slug: category };
  if (min || max) {
    where.price = {};
    if (min) (where.price as Record<string, number>).gte = parseInt(min);
    if (max) (where.price as Record<string, number>).lte = parseInt(max);
  }
  if (q) where.name = { contains: q, mode: "insensitive" };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true } },
        reviews: { select: { rating: true }, where: { approved: true } },
      },
      orderBy,
      skip,
      take: PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ select: { name: true, slug: true }, where: { parentId: null } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-5 sticky top-20">
            <h3 className="font-semibold text-navy">فیلترها</h3>

            {/* Category */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">دسته‌بندی</p>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className={`block text-sm px-2 py-1.5 rounded-lg transition-colors ${!category ? "bg-gold-pale text-gold font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  همه
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className={`block text-sm px-2 py-1.5 rounded-lg transition-colors ${category === c.slug ? "bg-gold-pale text-gold font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">قیمت (تومان)</p>
              <form className="flex gap-2" method="get" action="/products">
                {category && <input type="hidden" name="category" value={category} />}
                <input
                  type="number"
                  name="min"
                  placeholder="از"
                  defaultValue={min}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-gold"
                />
                <input
                  type="number"
                  name="max"
                  placeholder="تا"
                  defaultValue={max}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-gold"
                />
                <button type="submit" className="bg-navy text-white text-xs px-2 rounded-lg hover:bg-navy-light transition-colors">
                  اعمال
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{total} محصول یافت شد</p>
            <SortSelect value={sort} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>محصولی یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const url = new URLSearchParams(params as Record<string, string>);
                url.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/products?${url.toString()}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors ${
                      p === pageNum ? "bg-navy text-white" : "border border-gray-200 text-gray-600 hover:border-navy hover:text-navy"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
