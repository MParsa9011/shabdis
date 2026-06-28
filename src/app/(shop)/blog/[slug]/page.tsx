import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate, safeDecode } from "@/lib/utils";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, metaTitle: true, metaDescription: true, excerpt: true } });
  if (!post) return { title: "مقاله یافت نشد" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? "",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: { "@type": "Organization", name: "شبدیس" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4 max-w-3xl py-12">
        {post.coverImage && (
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-4 border-b border-gray-100">
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </>
  );
}
