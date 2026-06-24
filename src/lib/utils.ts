export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
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
