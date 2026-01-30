"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

// Mock data produk dari pusat
const availableProducts = [
  { id: "1", name: "Teh Tarik Original", unit: "cup", stockPusat: 500 },
  { id: "2", name: "Teh Tarik Gula Aren", unit: "cup", stockPusat: 350 },
  { id: "3", name: "Thai Tea", unit: "cup", stockPusat: 400 },
  { id: "4", name: "Matcha Latte", unit: "cup", stockPusat: 200 },
  { id: "5", name: "Brown Sugar Milk Tea", unit: "cup", stockPusat: 300 },
];

interface RequestFormProps {
  onAddItem: (item: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }) => void;
}

export function RequestForm({ onAddItem }: RequestFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const handleAdd = () => {
    if (!selectedProduct || !quantity) return;

    const product = availableProducts.find((p) => p.id === selectedProduct);
    if (!product) return;

    onAddItem({
      productId: product.id,
      productName: product.name,
      quantity: parseInt(quantity),
      unit: product.unit,
    });

    setSelectedProduct("");
    setQuantity("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Item Request</CardTitle>
        <CardDescription>
          Pilih produk dan jumlah yang ingin di-request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Produk</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger id="product" className="w-full">
              <SelectValue placeholder="Pilih produk..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {availableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - Stok: {product.stockPusat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Jumlah</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Masukkan jumlah..."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        <Button
          onClick={handleAdd}
          className="w-full"
          disabled={!selectedProduct || !quantity}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah ke Request
        </Button>
      </CardContent>
    </Card>
  );
}
