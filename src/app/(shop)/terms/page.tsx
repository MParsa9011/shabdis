import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "قوانین و مقررات خرید، ارسال، پرداخت و تعویض کالا در فروشگاه شبدیس.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-7">
      <h2 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-gold rounded-full" />
        {title}
      </h2>
      <div className="text-gray-700 leading-8 text-sm space-y-3">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  const settings = await getSettings();
  const shippingCost = parseInt(settings.shippingCost || "100000") || 100000;

  return (
    <main className="container mx-auto px-4 max-w-3xl py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-3">قوانین و مقررات</h1>
        <p className="text-gray-500">
          دوست گرامی، ضمن تشکر بابت انتخاب مجموعه ما، لطفاً قبل از خرید موارد زیر را مطالعه نمایید.
        </p>
      </div>

      <div className="space-y-5">
        <Section title="نحوه ارسال در شهر تهران و دیگر شهرها">
          <p>
            ارسال کالا: بسته شما بین ۳ الی ۵ روز به پست تحویل شده و ارسال می‌گردد و در حال حاضر هزینه
            ارسال پستی برای تمامی سفارشات <strong className="text-navy">{formatPrice(shippingCost)}</strong> است.
          </p>
          <p>
            کاربران باید هنگام سفارش کالای مورد نظر خود، فرم سفارش را با اطلاعات صحیح و به‌طور کامل تکمیل
            کنند. بدیهی است در صورت ورود اطلاعات ناقص یا نادرست، سفارش کاربر قابل پیگیری و تحویل نخواهد
            بود.
          </p>
          <p>تحویل سفارش در اماکن عمومی امکان‌پذیر نیست و لازم است آدرس تحویل، دقیق و قابل استناد باشد.</p>
        </Section>

        <Section title="قیمت کالا">
          <p>قیمت کلیه محصولات بر روی سایت بروز بوده و روزانه به‌واسطه نوسانات قیمتی نقره بروزرسانی می‌گردد.</p>
          <p>
            لازم به ذکر است افزودن کالا به سبد خرید به معنی رزرو کالا نیست و هیچ‌گونه حقی را برای مشتریان
            ایجاد نمی‌کند. همچنین تا پیش از ثبت نهایی، هرگونه تغییر از جمله تغییر در موجودی کالا یا قیمت،
            روی کالای افزوده‌شده به سبد خرید اعمال خواهد شد. بنابراین به مشتریانی که تمایل و تصمیم به خرید
            قطعی دارند توصیه می‌شود در اسرع وقت سفارش خود را نهایی کنند تا با اتمام موجودی یا تغییر قیمتی
            کالاها روبرو نشوند.
          </p>
        </Section>

        <Section title="نحوه پرداخت">
          <p>
            در طی فرایند خرید، پرداخت توسط کلیه کارت‌های عضو شتاب و توسط درگاه پرداخت امن سایت متصل به
            شبکه‌های شتاب بانکی صورت می‌پذیرد.
          </p>
        </Section>

        <Section title="شرایط تعویض کالا">
          <p>
            در صورت تماس با بخش پشتیبانی سایت، فقط تا ۲۴ ساعت پس از تحویل گرفتن کالا، درخواست تعویض
            پذیرفته است.
          </p>
          <p className="font-semibold text-navy">استفاده از ۲۴ ساعت ضمانت بازگشت چه شرایطی دارد؟</p>
          <ul className="list-disc pr-5 space-y-1.5">
            <li>کالای خریداری‌شده، ایراد داشته و یا با مشخصات درج‌شده در سایت مغایرت داشته باشد.</li>
            <li>اشکال و یا ایراد کالا باید حداکثر تا ۲۴ ساعت کاری پس از دریافت کالا، به فروشگاه اطلاع داده شود.</li>
          </ul>
        </Section>

        <Section title="مراحل درخواست تعویض">
          <ol className="list-decimal pr-5 space-y-2">
            <li>
              در وهله اول به هیچ عنوان کالا را بدون هماهنگی با بخش پشتیبانی ارسال نکنید. برای هماهنگی
              می‌توانید با شماره‌تماس‌های ما در صفحه «تماس با ما» در ساعات کاری تماس بگیرید (همه‌روزه به‌جز
              ایام تعطیل از ۹ صبح تا ۱۶).
            </li>
            <li>حتماً داخل بسته ارسالی، فاکتور خرید و یک نامه شامل مشخصات و دلیل درخواست تعویض را قرار دهید.</li>
            <li>در صورت استفاده از کالا، کالای مورد نظر قابل تعویض نبوده و هزینه ارسال کالا نیز بر عهده مشتری خواهد بود.</li>
            <li>در صورت مرجوع سفارش بنا به هر دلیلی، مبلغ محصول مرجوع‌شده فقط به حساب بانکی شخص خریدار واریز می‌شود.</li>
          </ol>
        </Section>
      </div>
    </main>
  );
}
