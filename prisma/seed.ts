import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tabarjin.ir" },
    update: {},
    create: {
      name: "مدیر سایت",
      email: "admin@tabarjin.ir",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✓ ادمین ایجاد شد:", admin.email);

  // Default shipping methods
  const shipping = [
    { name: "پست پیشتاز", price: 35000, duration: "۳ تا ۵ روز کاری" },
    { name: "پست سفارشی", price: 20000, duration: "۵ تا ۸ روز کاری" },
    { name: "پیک موتوری (تهران)", price: 50000, duration: "همان روز" },
    { name: "تیپاکس", price: 60000, duration: "۱ تا ۲ روز کاری" },
  ];
  for (const s of shipping) {
    await prisma.shippingMethod.upsert({
      where: { id: `seed-${s.name}` },
      update: {},
      create: { id: `seed-${s.name}`, ...s },
    });
  }
  console.log("✓ روش‌های ارسال ایجاد شدند");

  // Default categories
  const categories = [
    { name: "انگشتر", slug: "rings" },
    { name: "گردنبند", slug: "necklaces" },
    { name: "دستبند", slug: "bracelets" },
    { name: "گوشواره", slug: "earrings" },
    { name: "آویز", slug: "pendants" },
    { name: "ست زیورآلات", slug: "sets" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("✓ دسته‌بندی‌ها ایجاد شدند");

  // Default settings
  const settings = [
    { key: "siteName", value: "تبرجین" },
    { key: "siteDescription", value: "فروشگاه زیورآلات سنگ و نقره" },
    { key: "footerText", value: "تمام حقوق برای فروشگاه تبرجین محفوظ است." },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("✓ تنظیمات پیش‌فرض ایجاد شدند");

  console.log("\n🎉 دیتابیس با موفقیت آماده شد");
  console.log("🔑 ادمین: admin@tabarjin.ir / admin123");
  console.log("⚠️  رمز عبور ادمین را پس از اولین ورود تغییر دهید!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
