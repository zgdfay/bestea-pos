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
import { Badge } from "@/components/ui/badge";

// Mock data produk dari pusat
const availableProducts = [
  { id: "1", name: "Teh Tarik Original", unit: "cup", stockPusat: 500 },
  { id: "2", name: "Teh Tarik Gula Aren", unit: "cup", stockPusat: 350 },
  { id: "3", name: "Thai Tea", unit: "cup", stockPusat: 400 },
  { id: "4", name: "Matcha Latte", unit: "cup", stockPusat: 200 },
  { id: "5", name: "Brown Sugar Milk Tea", unit: "cup", stockPusat: 300 },
];

export function StockList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok Tersedia di Pusat</CardTitle>
        <CardDescription>Daftar produk yang bisa di-request</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="text-center">Stok</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      product.stockPusat > 200
                        ? "w-20 justify-center bg-green-100 text-green-700 border-green-200"
                        : "w-20 justify-center bg-yellow-100 text-yellow-700 border-yellow-200"
                    }
                  >
                    {product.stockPusat} {product.unit}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
