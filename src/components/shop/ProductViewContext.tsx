"use client";

import { createContext, useContext, useState } from "react";

type ProductViewState = {
  activeImage: string | null;
  setActiveImage: (url: string | null) => void;
};

const ProductViewCtx = createContext<ProductViewState>({
  activeImage: null,
  setActiveImage: () => {},
});

export function ProductViewProvider({ children }: { children: React.ReactNode }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  return (
    <ProductViewCtx.Provider value={{ activeImage, setActiveImage }}>
      {children}
    </ProductViewCtx.Provider>
  );
}

export const useProductView = () => useContext(ProductViewCtx);
