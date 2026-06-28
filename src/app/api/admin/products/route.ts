import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await req.json();
  const { name, slug, description, longDescription, price, comparePrice, categoryIds, inStock, featured, metaTitle, metaDescription, images, variantAttributes, variants } = data;

  const product = await prisma.product.create({
    data: {
      name, slug, description,
      longDescription: longDescription || null,
      price: parseInt(String(price)),
      comparePrice: comparePrice ? parseInt(String(comparePrice)) : null,
      categories: { connect: (categoryIds as string[] | undefined)?.map((id) => ({ id })) ?? [] },
      inStock, featured,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      variantAttributes: variantAttributes ?? [],
      images: { create: images?.map((img: { url: string; alt?: string | null; order?: number }) => ({ url: img.url, alt: img.alt || null, order: img.order ?? 0 })) ?? [] },
      variants: {
        create: variants?.map((v: { attributes: Record<string, string>; price?: number | null; stock: number; sku?: string | null; image?: string | null }) => ({
          attributes: v.attributes,
          price: v.price ?? null,
          stock: v.stock,
          sku: v.sku ?? null,
          image: v.image ?? null,
        })) ?? [],
      },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
