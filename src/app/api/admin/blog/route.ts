import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await req.json();
  const post = await prisma.blogPost.create({ data });
  return NextResponse.json(post, { status: 201 });
}
