import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "درباره شبدیس | گالری زیورآلات سنگ و نقره",
  description:
    "گالری شبدیس از سال ۱۳۸۸ در زمینه طراحی و تولید زیورآلات سنگ و نقره فعالیت می‌کند؛ ترکیبی از زیبایی، کیفیت و خلاقیت.",
  openGraph: {
    title: "درباره گالری شبدیس",
    description: "داستان ما و اهداف شبدیس",
    locale: "fa_IR",
  },
};

const stats = [
  { value: "۱۳۸۸", label: "سال تأسیس" },
  { value: "نقره ۹۲۵", label: "استرلینگ خالص" },
  { value: "۷ روز", label: "ضمانت بازگشت" },
  { value: "سراسری", label: "ارسال به تمام ایران" },
];

const goals = [
  {
    title: "کیفیت",
    desc: "ما به تولید زیورآلات با کیفیت بالا و استفاده از نقره ۹۲۵ می‌پردازیم. هر قطعه از محصولات ما با دقت و مراقبت طراحی و ساخته می‌شود.",
    d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "طراحی منحصربه‌فرد",
    desc: "زیورآلات شبدیس با ترکیبی از الگوها، سنگ‌های قیمتی و نیمه‌قیمتی و خلاقیت طراحان ما، به شما امکان می‌دهد قطعه‌ای منحصربه‌فرد انتخاب کنید.",
    d: "M6 3h12l4 6-10 13L2 9l4-6zM2 9h20M12 22L8 9l4-6 4 6-4 13z",
  },
  {
    title: "رضایت مشتریان",
    desc: "مشتریان ما برای ما ارزشمند هستند. ما به تلاش برای ارائه خدمات بهتر و پاسخگویی به نیازهای آن‌ها متعهدیم.",
    d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-16 w-64 h-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-gold-light blur-2xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl py-20 text-center relative">
          <span className="inline-flex items-center gap-2 bg-gold/20 text-gold-light border border-gold/30 rounded-full px-4 py-1.5 text-sm mb-6">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            از سال ۱۳۸۸
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">گالری شبدیس</h1>
          <p className="text-lg text-gray-300 leading-8 max-w-2xl mx-auto">
            یکی از پیشگامان طراحی و تولید زیورآلات سنگ و نقره؛ جایی که زیبایی، کیفیت و خلاقیت به هم می‌رسند.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 max-w-5xl -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-gold">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-16 space-y-16">
        {/* Story */}
        <section className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold text-navy mb-4">داستان ما</h2>
            <p className="text-gray-700 leading-9">
              گالری شبدیس، از سال ۱۳۸۸ در زمینه طراحی و تولید زیورآلات سنگ و نقره، به عنوان یکی از
              پیشگامان در این صنعت فعالیت می‌کند. ما با افتخار زیورآلاتی را ارائه می‌دهیم که ترکیبی از
              زیبایی، کیفیت و خلاقیت را در خود جای داده‌اند.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-cream to-gold-pale flex items-center justify-center border border-gold/20">
              <svg className="w-24 h-24 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 3h12l4 6-10 13L2 9l4-6zM2 9h20M12 22L8 9l4-6 4 6-4 13z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Goals */}
        <section>
          <h2 className="text-2xl font-bold text-navy mb-2 text-center">اهداف ما</h2>
          <p className="text-gray-500 text-center mb-8">آنچه شبدیس را متمایز می‌کند</p>
          <div className="grid md:grid-cols-3 gap-6">
            {goals.map((g) => (
              <div key={g.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gold/40 hover:shadow-md transition-all">
                <div className="w-14 h-14 mb-4 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={g.d} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{g.title}</h3>
                <p className="text-gray-600 text-sm leading-7">{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy text-white rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-gold/10 blur-2xl pointer-events-none" />
          <h2 className="text-2xl font-bold mb-3 relative">مجموعه شبدیس را ببینید</h2>
          <p className="text-white/80 mb-6 relative">جدیدترین زیورآلات سنگ و نقره را در فروشگاه ما کشف کنید.</p>
          <div className="flex flex-wrap justify-center gap-3 relative">
            <Link href="/product" className="bg-gold text-white px-7 py-3 rounded-xl font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20">
              مشاهده محصولات
            </Link>
            <a href="https://instagram.com/tabarjin" target="_blank" rel="noopener noreferrer" className="border border-white/30 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              اینستاگرام
            </a>
            <a href="https://t.me/tabarjin" target="_blank" rel="noopener noreferrer" className="border border-white/30 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              تلگرام
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
