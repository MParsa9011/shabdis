import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { safeDecode } from "@/lib/utils";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: `${category.name} | شبدیس`,
    description: `خرید انواع ${category.name} از فروشگاه شبدیس`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const pageSize = 12;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where = { categories: { some: { id: { in: categoryIds } } } };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1 },
        categories: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ inStock: "desc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">{category.name}</h1>
        <p className="text-gray-500 mt-2">{total} محصول</p>
      </div>

      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {category.children.map((sub) => (
            <a
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="px-4 py-2 bg-white border border-gold/40 rounded-full text-sm text-navy hover:bg-gold/10 transition-colors"
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">محصولی در این دسته‌بندی وجود ندارد</p>
          <a href="/product" className="mt-4 inline-block text-navy underline">مشاهده همه محصولات</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/categories/${slug}?page=${p}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-navy text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-navy"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
