import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "../../../(dashboard)/dashboard/produk/data/mock-data-products";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Format price to IDR
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  // Get lowest price from variants if available, else use base price
  const lowestPrice =
    product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : product.price;

  return (
    <Card
      className={`overflow-hidden border-green-100 transition-all shadow-sm flex flex-col h-full relative group ${
        product.trackStock && (product.stock || 0) <= 0
          ? "opacity-60 grayscale cursor-not-allowed border-slate-200"
          : "hover:border-green-300 hover:shadow-md cursor-pointer"
      }`}
      onClick={() => {
        if (product.trackStock && (product.stock || 0) <= 0) return;
        onAddToCart(product);
      }}
    >
      <div className="h-32 w-full bg-slate-50 relative overflow-hidden flex-shrink-0">
        {/* Placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Image
            src={product.image || "/images/placeholder-image.svg"}
            alt={product.name}
            fill
            className="object-contain p-1"
          />
        </div>

        {/* Stock Badge */}
        {product.trackStock && (
          <div className="absolute top-2 right-2 z-10">
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border ${
                (product.stock || 0) <= 0
                  ? "bg-red-100 text-red-700 border-red-200"
                  : (product.stock || 0) < 10
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-white/90 text-slate-600 border-slate-200 backdrop-blur-sm"
              }`}
            >
              {(product.stock || 0) <= 0 ? "Habis" : `${product.stock} Stok`}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between relative">
        <div className="space-y-1">
          <h3 className="font-semibold text-xs md:text-sm text-slate-800 line-clamp-1 leading-tight">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {product.variants &&
              product.variants.map((v) => (
                <span
                  key={v.name}
                  className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded-[3px]"
                >
                  {v.name === "Medium"
                    ? "M"
                    : v.name === "Large"
                      ? "L"
                      : v.name === "Standard"
                        ? "Normal"
                        : v.name}
                </span>
              ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-green-600 font-bold text-xs md:text-sm bg-green-50 w-fit px-1.5 py-0.5 rounded-sm">
              {formatter.format(lowestPrice)}
            </p>
          </div>
        </div>

        {(!product.trackStock || (product.stock || 0) > 0) && (
          <Button
            className="absolute bottom-2 right-4 h-7 w-7 rounded-full shadow-sm bg-green-600 hover:bg-green-700 text-white p-0 opacity-100 transition-opacity"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
