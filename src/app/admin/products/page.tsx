import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدیریت محصولات" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      categories: { select: { name: true } },
      _count: { select: { variants: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">محصولات ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy-light transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن محصول
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-medium">محصول</th>
                <th className="text-right px-4 py-3 font-medium">دسته</th>
                <th className="text-right px-4 py-3 font-medium">قیمت</th>
                <th className="text-right px-4 py-3 font-medium">موجودی</th>
                <th className="text-right px-4 py-3 font-medium">دیدگاه</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream border border-gray-100 shrink-0">
                        {product.images[0] ? (
                          <Image src={product.images[0].url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-cream" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-navy">{product.name}</p>
                        <p className="text-xs text-gray-400">{product._count.variants} variant</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.categories.map((c) => c.name).join("، ") || "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {product.inStock ? "موجود" : "ناموجود"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product._count.reviews}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-gold hover:text-gold-dark">
                      ویرایش
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
