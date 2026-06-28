"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/cart";
import { useProductView } from "@/components/shop/ProductViewContext";
import Button from "@/components/ui/Button";
import type { CartItem } from "@/types";

type Variant = {
  id: string;
  attributes: Record<string, string>;
  price?: number | null;
  stock: number;
  image?: string | null;
};

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
    variantAttributes: string[];
    variants: Variant[];
    inStock: boolean;
  };
};

export default function AddToCart({ product }: Props) {
  const { addItem } = useCart();
  const { setActiveImage } = useProductView();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasVariants = product.variants.length > 0;

  const selectedVariant = hasVariants
    ? product.variants.find((v) =>
        Object.entries(selectedAttributes).every(
          ([key, val]) => (v.attributes as Record<string, string>)[key] === val
        )
      )
    : null;

  // When the selected variant has its own image, switch the gallery to it.
  useEffect(() => {
    if (selectedVariant?.image) setActiveImage(selectedVariant.image);
  }, [selectedVariant, setActiveImage]);

  const price = selectedVariant?.price ?? product.price;
  const stock = hasVariants ? (selectedVariant?.stock ?? 0) : 999;
  const allSelected = !hasVariants || product.variantAttributes.every((a) => selectedAttributes[a]);
  const canAdd = product.inStock && stock > 0 && allSelected;

  const handleAdd = () => {
    if (!canAdd) return;
    const item: CartItem = {
      id: selectedVariant?.id ?? product.id,
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price,
      image: selectedVariant?.image ?? product.images[0]?.url ?? null,
      quantity,
      stock,
      variantLabel: selectedVariant
        ? Object.entries(selectedVariant.attributes as Record<string, string>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" / ")
        : null,
    };
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getAttributeValues = (attrName: string) => {
    const values = new Set<string>();
    product.variants.forEach((v) => {
      const attrs = v.attributes as Record<string, string>;
      if (attrs[attrName]) values.add(attrs[attrName]);
    });
    return Array.from(values);
  };

  const isAvailableWith = (attrName: string, value: string) => {
    return product.variants.some((v) => {
      const attrs = v.attributes as Record<string, string>;
      if (attrs[attrName] !== value) return false;
      const otherSelected = Object.entries(selectedAttributes).filter(([k]) => k !== attrName);
      return otherSelected.every(([k, val]) => attrs[k] === val);
    });
  };

  // Total stock for a given attribute value, considering the other selected attributes.
  const stockWith = (attrName: string, value: string) => {
    return product.variants
      .filter((v) => {
        const attrs = v.attributes as Record<string, string>;
        if (attrs[attrName] !== value) return false;
        const otherSelected = Object.entries(selectedAttributes).filter(([k]) => k !== attrName);
        return otherSelected.every(([k, val]) => attrs[k] === val);
      })
      .reduce((s, v) => s + v.stock, 0);
  };

  return (
    <div className="space-y-4">
      {/* Variant selectors */}
      {product.variantAttributes.map((attrName) => (
        <div key={attrName}>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {attrName}
            {selectedAttributes[attrName] && (
              <span className="mr-2 text-gold font-semibold">{selectedAttributes[attrName]}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {getAttributeValues(attrName).map((val) => {
              const available = isAvailableWith(attrName, val);
              const outOfStock = available && stockWith(attrName, val) <= 0;
              const selected = selectedAttributes[attrName] === val;
              return (
                <button
                  key={val}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrName]: val }))}
                  className={[
                    "px-3 py-1.5 rounded-lg border text-sm transition-all",
                    selected
                      ? "border-navy bg-navy text-white"
                      : outOfStock
                      ? "border-gray-100 text-gray-400 line-through hover:border-gray-300"
                      : available
                      ? "border-gray-200 text-gray-700 hover:border-navy hover:text-navy"
                      : "border-gray-100 text-gray-300 cursor-not-allowed line-through",
                  ].join(" ")}
                  title={outOfStock ? "ناموجود" : undefined}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quantity + Add */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!canAdd}
          variant={added ? "secondary" : "primary"}
          size="lg"
          className="flex-1"
        >
          {added
            ? "✓ اضافه شد"
            : !product.inStock
            ? "ناموجود"
            : !allSelected
            ? "لطفاً ویژگی‌ها را انتخاب کنید"
            : stock <= 0
            ? "ناموجود"
            : "افزودن به سبد خرید"}
        </Button>
      </div>

      {allSelected && product.inStock && stock <= 0 && (
        <p className="text-sm font-medium text-red-500">این ویژگی در حال حاضر ناموجود است</p>
      )}
      {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
        <p className="text-xs text-amber-600">تنها {selectedVariant.stock.toLocaleString("fa-IR")} عدد در انبار باقی مانده</p>
      )}
    </div>
  );
}
