import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شبدیس | زیورآلات سنگ و نقره اصیل",
  description: "فروشگاه آنلاین زیورآلات سنگ و نقره. انگشتر، دستبند، گردنبند و گوشواره با طراحی منحصربه‌فرد.",
};

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, inStock: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true } },
        reviews: { select: { rating: true }, where: { approved: true } },
      },
      take: 8,
    });
  } catch { return []; }
}

async function getNewAndDiscounted() {
  try {
    const [newest, discounted] = await Promise.all([
      prisma.product.findMany({
        where: { inStock: true },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true } },
          reviews: { select: { rating: true }, where: { approved: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { inStock: true, comparePrice: { not: null } },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { name: true } },
          reviews: { select: { rating: true }, where: { approved: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
    return { newest, discounted };
  } catch { return { newest: [], discounted: [] }; }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      take: 6,
    });
  } catch { return []; }
}

async function getLatestPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch { return []; }
}

const features = [
  {
    title: "ارسال سریع",
    desc: "به سراسر ایران",
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8m-4-4v4M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    title: "ضمانت اصالت",
    desc: "کالای تضمینی",
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "بازگشت کالا",
    desc: "تا ۷ روز",
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "پشتیبانی",
    desc: "همیشه در کنارتان",
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name, role: (session.user as { role?: string }).role }
    : null;

  const [featured, { newest, discounted }, categories, posts] = await Promise.all([
    getFeaturedProducts(),
    getNewAndDiscounted(),
    getCategories(),
    getLatestPosts(),
  ]);

  return (
    <>
      <Header user={user} />
      <CartDrawer />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gold-light blur-2xl" />
          </div>
          <div className="container mx-auto px-4 max-w-7xl py-20 md:py-32 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-light border border-gold/30 rounded-full px-4 py-1.5 text-sm mb-6">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                زیورآلات منحصربه‌فرد
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                زیبایی طبیعت،<br />
                <span className="text-gold">هنر دست انسان</span>
              </h1>
              <p className="text-gray-300 text-lg leading-8 mb-8 max-w-lg">
                مجموعه‌ای از زیورآلات سنگ و نقره با طراحی منحصربه‌فرد. هر قطعه داستانی دارد از دل طبیعت.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="bg-gold text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20">
                  مشاهده محصولات
                </Link>
                <Link href="/about" className="border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  درباره ما
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features strip */}
        <section className="bg-cream border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-7xl py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((f) => (
                <div key={f.title} className="flex items-center gap-3 p-3">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="container mx-auto px-4 max-w-7xl py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy">دسته‌بندی‌ها</h2>
                <p className="text-gray-500 text-sm mt-1">محصولات ما را بر اساس دسته پیدا کنید</p>
              </div>
              <Link href="/products" className="text-gold text-sm font-medium hover:text-gold-dark transition-colors">
                همه دسته‌ها ←
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group text-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-gold/40 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-cream to-gold-pale flex items-center justify-center">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} width={40} height={40} className="object-contain" />
                    ) : (
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-navy group-hover:text-gold transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat._count.products} محصول</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured products */}
        {featured.length > 0 && (
          <section className="container mx-auto px-4 max-w-7xl py-8 pb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy">محصولات ویژه</h2>
                <p className="text-gray-500 text-sm mt-1">منتخب ما برای شما</p>
              </div>
              <Link href="/products" className="text-gold text-sm font-medium hover:text-gold-dark transition-colors">
                همه محصولات ←
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* New & Discounted basin */}
        <section className="bg-cream py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* New arrivals */}
              {newest.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-7 bg-navy rounded-full" />
                      <div>
                        <h2 className="text-xl font-bold text-navy">جدیدترین‌ها</h2>
                        <p className="text-xs text-gray-400">تازه‌واردها</p>
                      </div>
                    </div>
                    <Link href="/products?sort=newest" className="text-sm text-gold hover:text-gold-dark transition-colors">
                      همه ←
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {newest.slice(0, 4).map((p) => (
                      <Link key={p.id} href={`/products/${p.slug}`} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100 hover:border-gold/30 hover:shadow-sm transition-all group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream shrink-0">
                          {p.images[0] ? (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="w-full h-full bg-gold-pale" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">{p.category.name}</p>
                          <p className="text-sm font-semibold text-navy line-clamp-1 group-hover:text-gold transition-colors">{p.name}</p>
                          <p className="text-sm font-bold text-gold mt-0.5">
                            {p.price.toLocaleString("fa-IR")} تومان
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-block bg-navy/5 text-navy text-xs px-2 py-0.5 rounded-full">جدید</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Discounted */}
              {discounted.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-7 bg-gold rounded-full" />
                      <div>
                        <h2 className="text-xl font-bold text-navy">تخفیف‌دار</h2>
                        <p className="text-xs text-gray-400">فرصت‌های ویژه</p>
                      </div>
                    </div>
                    <Link href="/products" className="text-sm text-gold hover:text-gold-dark transition-colors">
                      همه ←
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {discounted.slice(0, 4).map((p) => {
                      const disc = p.comparePrice && p.comparePrice > p.price
                        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                        : null;
                      return (
                        <Link key={p.id} href={`/products/${p.slug}`} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100 hover:border-gold/30 hover:shadow-sm transition-all group">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream shrink-0">
                            {p.images[0] ? (
                              <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="w-full h-full bg-gold-pale" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">{p.category.name}</p>
                            <p className="text-sm font-semibold text-navy line-clamp-1 group-hover:text-gold transition-colors">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-sm font-bold text-gold">{p.price.toLocaleString("fa-IR")} تومان</p>
                              {p.comparePrice && (
                                <p className="text-xs text-gray-400 line-through">{p.comparePrice.toLocaleString("fa-IR")}</p>
                              )}
                            </div>
                          </div>
                          {disc && (
                            <div className="shrink-0">
                              <span className="inline-block bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full font-bold">
                                {disc}٪
                              </span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="bg-gradient-to-r from-navy-dark to-navy mx-4 md:mx-auto max-w-7xl rounded-3xl overflow-hidden my-16 relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-gold blur-2xl" />
          </div>
          <div className="relative px-8 py-12 md:py-16 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">طراحی سفارشی</h2>
            <p className="text-gray-300 mb-6">محصول سفارشی با سنگ و طراحی مورد علاقه شما</p>
            <Link href="/about" className="inline-block bg-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-gold-light transition-colors">
              تماس با ما
            </Link>
          </div>
        </section>

        {/* Blog */}
        {posts.length > 0 && (
          <section className="container mx-auto px-4 max-w-7xl pb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy">آخرین مقالات</h2>
                <p className="text-gray-500 text-sm mt-1">از دنیای سنگ و زیورآلات بیشتر بدانید</p>
              </div>
              <Link href="/blog" className="text-gold text-sm font-medium hover:text-gold-dark transition-colors">
                همه مقالات ←
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gold/30 transition-all">
                    <div className="relative h-44 bg-gradient-to-br from-cream to-gold-pale">
                      {post.coverImage && (
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy line-clamp-2 group-hover:text-gold transition-colors mb-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
