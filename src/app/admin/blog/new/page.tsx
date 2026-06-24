import BlogEditor from "@/components/admin/BlogEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پست جدید" };

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">پست جدید</h1>
      <BlogEditor />
    </div>
  );
}
