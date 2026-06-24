import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "شبدیس | زیورآلات سنگ و نقره",
    template: "%s | شبدیس",
  },
  description: "فروشگاه آنلاین زیورآلات سنگ و نقره اصیل ایرانی. انگشتر، دستبند، گردنبند و گوشواره با طراحی منحصربه‌فرد.",
  keywords: ["زیورآلات", "سنگ و نقره", "انگشتر", "دستبند", "گردنبند", "جواهر", "شبدیس"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "شبدیس",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
