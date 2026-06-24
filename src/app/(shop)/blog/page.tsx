import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بلاگ",
  description: "مقالات و راهنماهایی درباره زیورآلات، سنگ‌های قیمتی و نقره",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 max-w-5xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-navy mb-3">مجله تبرجین</h1>
        <p className="text-gray-500">راهنما، داستان‌ها و نکاتی درباره زیورآلات</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">هنوز مقاله‌ای منتشر نشده</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gold/30 transition-all h-full flex flex-col">
                <div className="relative h-48 bg-gradient-to-br from-cream to-gold-pale">
                  {post.coverImage && (
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-navy line-clamp-2 mb-2 group-hover:text-gold transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3 flex-1">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-auto">{formatDate(post.createdAt)}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
