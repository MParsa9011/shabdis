"use client";

export default function SortSelect({ value }: { value: string }) {
  return (
    <select
      name="sort"
      defaultValue={value}
      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold"
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        window.location.href = url.toString();
      }}
    >
      <option value="newest">جدیدترین</option>
      <option value="price-asc">ارزان‌ترین</option>
      <option value="price-desc">گران‌ترین</option>
    </select>
  );
}
