import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { TopProduct } from "../data/mock-reports";
import { Package } from "lucide-react";

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Menu Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium text-sm">
              Belum ada data produk terlaris
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{product.sold} Terjual</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
