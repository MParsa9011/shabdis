import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "افزودن محصول جدید" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">افزودن محصول جدید</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
