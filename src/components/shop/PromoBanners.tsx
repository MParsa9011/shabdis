import Link from "next/link";
import Image from "next/image";

type Props = {
  promo1Image?: string;
  promo1Link?: string;
  promo2Image?: string;
  promo2Link?: string;
  promoCoupon?: string;
};

function Banner({ image, link, coupon }: { image: string; link: string; coupon?: string }) {
  return (
    <Link href={link || "/product"} className="group relative block w-full aspect-[2/1] rounded-2xl overflow-hidden bg-cream border border-gray-100">
      <Image src={image} alt="بنر" fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
      {coupon && (
        <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2">
          <span className="text-white text-sm font-medium drop-shadow">کد تخفیف</span>
          <span className="bg-white/90 backdrop-blur text-navy font-mono font-bold text-base px-4 py-1.5 rounded-xl border-2 border-dashed border-gold shadow-lg">
            {coupon}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function PromoBanners({ promo1Image, promo1Link, promo2Image, promo2Link, promoCoupon }: Props) {
  const has1 = !!promo1Image?.trim();
  const has2 = !!promo2Image?.trim();
  if (!has1 && !has2) return null;

  return (
    <section className="container mx-auto px-4 max-w-7xl py-10">
      <div className="grid md:grid-cols-2 gap-5">
        {has1 && <Banner image={promo1Image!.trim()} link={promo1Link?.trim() || "/product"} />}
        {has2 && <Banner image={promo2Image!.trim()} link={promo2Link?.trim() || "/product"} coupon={promoCoupon?.trim() || undefined} />}
      </div>
    </section>
  );
}
