import { Product } from "../../../(dashboard)/dashboard/produk/data/mock-data-products";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  onAddToCart: (product: Product) => void;
}

import { PackageSearch } from "lucide-react";

// ... existing code ...

export function ProductGrid({
  products,
  selectedCategory,
  onAddToCart,
}: ProductGridProps) {
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-64 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <PackageSearch className="h-10 w-10 text-slate-400" />
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          Tidak ada produk
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Coba pilih kategori lain atau tambah produk baru.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
