import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await req.json();
  const { name, slug, description, price, comparePrice, categoryId, inStock, featured, metaTitle, metaDescription, images, variantAttributes, variants } = data;

  const product = await prisma.product.create({
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

  return NextResponse.json(product, { status: 201 });
}
