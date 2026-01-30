"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const topProducts = [
  { rank: 1, name: "Jasmine Tea", category: "Tea", sold: 48, revenue: 864000 },
  { rank: 2, name: "Mango Milk", category: "Milk", sold: 42, revenue: 630000 },
  { rank: 3, name: "Lychee Tea", category: "Tea", sold: 38, revenue: 684000 },
  {
    rank: 4,
    name: "Matcha Latte",
    category: "Coffee",
    sold: 35,
    revenue: 700000,
  },
  { rank: 5, name: "Lemon Tea", category: "Tea", sold: 32, revenue: 512000 },
];

export function TopProducts() {
  return (
    <Card className="col-span-4 flex flex-col max-h-[440px]">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-base md:text-lg">Produk Terlaris</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Top 5 produk dengan penjualan tertinggi hari ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-xs">#</TableHead>
              <TableHead className="text-xs">Produk</TableHead>
              <TableHead className="text-xs text-center hidden sm:table-cell">
                Terjual
              </TableHead>
              <TableHead className="text-xs text-right">Pendapatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.rank}>
                <TableCell className="py-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      product.rank === 1
                        ? "bg-amber-100 text-amber-700"
                        : product.rank === 2
                          ? "bg-slate-100 text-slate-700"
                          : product.rank === 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {product.rank}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="font-medium text-xs md:text-sm">
                    {product.name}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">
                    {product.category}
                  </div>
                </TableCell>
                <TableCell className="py-2 text-center hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                    <TrendingUp className="h-3 w-3" />
                    {product.sold}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-right font-bold text-xs md:text-sm">
                  {formatter.format(product.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
