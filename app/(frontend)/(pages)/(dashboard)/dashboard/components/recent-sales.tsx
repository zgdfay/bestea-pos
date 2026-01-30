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

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const recentSales = [
  {
    order: "TRX-001234",
    name: "Jasmine Tea (L)",
    method: "QRIS",
    amount: 18000,
  },
  {
    order: "TRX-001233",
    name: "Mango Milk (M)",
    method: "Tunai",
    amount: 15000,
  },
  {
    order: "TRX-001232",
    name: "Lemon Tea (L) + 2",
    method: "Tunai",
    amount: 45000,
  },
  {
    order: "TRX-001231",
    name: "Choco Hazelnut",
    method: "QRIS",
    amount: 22000,
  },
  {
    order: "TRX-001230",
    name: "Lychee Tea (L)",
    method: "Tunai",
    amount: 18000,
  },
];

export function RecentSales() {
  return (
    <Card className="col-span-4 lg:col-span-3 flex flex-col max-h-[440px]">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-base md:text-lg">
          Transaksi Terakhir
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          5 transaksi terbaru dari kasir.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">
                Metode
              </TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale) => (
              <TableRow key={sale.order}>
                <TableCell className="py-2">
                  <div className="font-medium text-xs md:text-sm">
                    {sale.order}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">
                    {sale.name}
                  </div>
                </TableCell>
                <TableCell className="py-2 hidden sm:table-cell">
                  <span className="text-xs">{sale.method}</span>
                </TableCell>
                <TableCell className="py-2 text-right font-bold text-xs md:text-sm">
                  {formatter.format(sale.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
