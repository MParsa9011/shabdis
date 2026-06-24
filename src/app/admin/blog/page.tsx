import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدیریت بلاگ" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">بلاگ ({posts.length})</h1>
        <Link href="/admin/blog/new" className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy-light transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          پست جدید
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">{post.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {post.published ? "منتشر" : "پیش‌نویس"}
              </span>
              <Link href={`/admin/blog/${post.id}/edit`} className="text-xs text-gold hover:text-gold-dark">ویرایش</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
