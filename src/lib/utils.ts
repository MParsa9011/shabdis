export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

// Safely decode a URL route param (Next.js may pass non-ASCII slugs still encoded).
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Strip HTML tags to get plain text (for meta descriptions, previews, etc.).
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Convert any number to Persian digits (e.g. 25 → ۲۵).
export function faNum(value: number | string): string {
  return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(Number(value));
}

// Convert Persian/Arabic digits (and separators) in a string to English digits.
export function toEnglishDigits(input: string): string {
  if (!input) return input;
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  return input
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)))
    .replace(/[،٬]/g, "") // remove Persian/Arabic thousands separators
    .replace(/,/g, "");
}

// Parse an integer that may contain Persian/Arabic digits; returns null if invalid.
export function parseIntFa(input: string | undefined | null): number | null {
  if (input == null) return null;
  const cleaned = toEnglishDigits(String(input)).trim();
  if (!cleaned) return null;
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w؀-ۿ-]/g, "")
    .replace(/--+/g, "-");
}

export function generateSKU(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, cur) => acc.flatMap((a) => cur.map((b) => [...a, b])),
    [[]]
  );
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-700 bg-yellow-50",
  PAID: "text-blue-700 bg-blue-50",
  PROCESSING: "text-indigo-700 bg-indigo-50",
  SHIPPED: "text-purple-700 bg-purple-50",
  DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-red-700 bg-red-50",
};
