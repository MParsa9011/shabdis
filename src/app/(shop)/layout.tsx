import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import { auth } from "@/lib/auth";
import { getNavCategories } from "@/lib/categories";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name, role: (session.user as { role?: string }).role }
    : null;
  const categories = await getNavCategories();

  return (
    <>
      <Header user={user} categories={categories} />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
