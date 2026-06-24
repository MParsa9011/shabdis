import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش پست" };

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">ویرایش: {post.title}</h1>
      <BlogEditor initialData={post} />
    </div>
  );
}
