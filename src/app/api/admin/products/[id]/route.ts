import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const data = await req.json();
  const { name, slug, description, price, comparePrice, categoryId, inStock, featured, metaTitle, metaDescription, images, variantAttributes, variants } = data;

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });

    await tx.product.update({
      where: { id },
      data: {
        name, slug, description,
        price: parseInt(String(price)),
        comparePrice: comparePrice ? parseInt(String(comparePrice)) : null,
        categoryId, inStock, featured,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        variantAttributes: variantAttributes ?? [],
        images: { create: images?.map((img: { url: string; order?: number }) => ({ url: img.url, order: img.order ?? 0 })) ?? [] },
        variants: {
          create: variants?.map((v: { attributes: Record<string, string>; price?: number | null; stock: number; sku?: string | null }) => ({
            attributes: v.attributes,
            price: v.price ?? null,
            stock: v.stock,
            sku: v.sku ?? null,
          })) ?? [],
        },
      },
    });
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
