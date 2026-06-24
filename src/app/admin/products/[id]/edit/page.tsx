import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش محصول" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">ویرایش: {product.name}</h1>
      <ProductForm
        categories={categories}
        initialData={{
          ...product,
          variantAttributes: (product.variantAttributes as string[]) ?? [],
          variants: product.variants.map((v) => ({
            ...v,
            attributes: v.attributes as Record<string, string>,
          })),
          images: product.images.map((img) => ({ id: img.id, url: img.url })),
        }}
      />
    </div>
  );
}
