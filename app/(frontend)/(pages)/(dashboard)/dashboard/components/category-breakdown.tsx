"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const categoryBreakdown = [
  { category: "Tea", percentage: 45, revenue: 1612000, color: "bg-green-500" },
  { category: "Milk", percentage: 28, revenue: 1003000, color: "bg-blue-500" },
  {
    category: "Coffee",
    percentage: 18,
    revenue: 645000,
    color: "bg-amber-500",
  },
  {
    category: "Squash",
    percentage: 9,
    revenue: 320000,
    color: "bg-purple-500",
  },
];

export function CategoryBreakdown() {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">
          Penjualan per Kategori
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Breakdown penjualan berdasarkan kategori produk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryBreakdown.map((cat) => (
          <div key={cat.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="font-medium">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-muted-foreground text-xs">
                  {cat.percentage}%
                </span>
                <span className="font-bold w-20 md:w-24 text-right text-xs md:text-sm">
                  {formatter.format(cat.revenue)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${cat.color} transition-all`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}

        <div className="pt-3 border-t mt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-xs md:text-sm">
              Total Pendapatan
            </span>
            <span className="text-lg md:text-xl font-bold">
              {formatter.format(3580000)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
