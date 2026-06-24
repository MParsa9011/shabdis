import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره شبدیس | فروشگاه زیورآلات سنگ و نقره",
  description:
    "شبدیس؛ مرجع خرید آنلاین زیورآلات دست‌ساز سنگ و نقره اصیل ایرانی. محصولات ما با دقت و عشق به هنر ساخته می‌شوند.",
  openGraph: {
    title: "درباره شبدیس",
    description: "داستان ما و فلسفه شبدیس",
    locale: "fa_IR",
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-navy mb-4">درباره شبدیس</h1>
        <p className="text-xl text-gray-600">هنر زیورآلات سنگ و نقره</p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="bg-cream rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-navy mb-4">داستان ما</h2>
          <p className="text-gray-700 leading-8">
            شبدیس با عشق به هنر اصیل ایرانی و زیورآلات دست‌ساز پایه‌گذاری شده است. نام شبدیس از واژه فارسی
            «تبر» گرفته شده که نشانه‌ای از قدرت و اصالت در هنر ایرانی است. ما بر این باوریم که هر زیور
            باید داستانی داشته باشد — داستانی از سنگ‌های طبیعی، نقره ناب و دستانی که با مهارت آن را شکل
            می‌دهند.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gold/20 shadow-sm">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="text-lg font-bold text-navy mb-2">سنگ‌های اصل</h3>
            <p className="text-gray-600 text-sm">تمام سنگ‌های به‌کاررفته در محصولات ما طبیعی و اصل هستند</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gold/20 shadow-sm">
            <div className="text-4xl mb-3">🔨</div>
            <h3 className="text-lg font-bold text-navy mb-2">دست‌ساز</h3>
            <p className="text-gray-600 text-sm">هر محصول با دقت توسط هنرمندان ایرانی ساخته می‌شود</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gold/20 shadow-sm">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-bold text-navy mb-2">کیفیت تضمینی</h3>
            <p className="text-gray-600 text-sm">با ضمانت برگشت ۷ روزه در صورت عدم رضایت</p>
          </div>
        </div>

        <div className="bg-navy text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">تعهد ما</h2>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-start gap-3">
              <span className="text-gold mt-1">✓</span>
              <span>استفاده از نقره ۹۲۵ (استرلینگ) در تمام محصولات نقره</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold mt-1">✓</span>
              <span>بسته‌بندی مناسب و ارسال ایمن به تمام نقاط ایران</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold mt-1">✓</span>
              <span>پشتیبانی و راهنمایی در انتخاب محصول مناسب</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold mt-1">✓</span>
              <span>قیمت مناسب با حفظ کیفیت اصیل</span>
            </li>
          </ul>
        </div>

        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-navy mb-4">با ما در ارتباط باشید</h2>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="https://instagram.com/tabarjin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
            >
              اینستاگرام
            </a>
            <a
              href="https://t.me/tabarjin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white rounded-full hover:opacity-90 transition-opacity"
            >
              تلگرام
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
