export type CartItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  variantLabel?: string | null;
  price: number;
  image?: string | null;
  quantity: number;
  stock: number;
  slug: string;
};

export type CheckoutAddress = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
};
