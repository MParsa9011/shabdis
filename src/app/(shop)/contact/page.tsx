import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import ContactForm from "@/components/shop/ContactForm";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با گالری شبدیس؛ شماره تماس، ایمیل و فرم تماس.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const phone = s.sitePhone?.trim() || "۰۲۱-۱۲۳۴۵۶۷۸";
  const email = s.siteEmail?.trim() || "info@tabarjin.com";
  const address = s.siteAddress?.trim() || "";
  const instagram = s.instagram?.trim();
  const telegram = s.telegram?.trim();

  const items = [
    {
      label: "شماره تماس",
      value: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    },
    {
      label: "ایمیل",
      value: email,
      href: `mailto:${email}`,
      d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    ...(instagram
      ? [{
          label: "اینستاگرام",
          value: `@${instagram.replace(/^@/, "")}`,
          href: `https://instagram.com/${instagram.replace(/^@/, "")}`,
          external: true,
          d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z",
        }]
      : []),
    ...(telegram
      ? [{
          label: "تلگرام",
          value: telegram.replace(/^https?:\/\/(t\.me\/)?/, "").replace(/^@/, "") || telegram,
          href: telegram.startsWith("http") ? telegram : `https://t.me/${telegram.replace(/^@/, "")}`,
          external: true,
          d: "M21.5 4.5L2.5 12.5l5.5 1.5m13-9.5l-3 14-5-4.5m8-9.5L8 16m0 0v4l3-3",
        }]
      : []),
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-16 w-56 h-56 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl py-16 text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">تماس با ما</h1>
          <p className="text-gray-300">خوشحال می‌شویم صدای شما را بشنویم. همه‌روزه به‌جز ایام تعطیل، ۹ صبح تا ۱۶.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12 grid md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="space-y-4">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              {...(("external" in it && it.external) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-gold/40 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={it.d} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{it.label}</p>
                <p className="text-navy font-semibold" dir="ltr">{it.value}</p>
              </div>
            </a>
          ))}

          {address && (
            <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">آدرس</p>
                <p className="text-navy text-sm leading-7">{address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div>
          <h2 className="text-lg font-bold text-navy mb-4">ارسال پیام</h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
