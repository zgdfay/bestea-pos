"use client";

import { useState } from "react";
import { useBranch } from "@/contexts/branch-context";
import { toast } from "sonner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RequestForm } from "./components/request-form";
import { StockList } from "./components/stock-list";
import { RequestSummary, RequestItem } from "./components/request-summary";

export default function RequestStokPage() {
  const { currentBranch, isAdmin } = useBranch();
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);

  // Redirect jika admin
  if (isAdmin) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-yellow-600">
              Akses Terbatas
            </CardTitle>
            <CardDescription className="text-center">
              Halaman ini hanya tersedia untuk cabang. Silakan switch ke cabang
              untuk mengakses fitur Request Stok.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAddItem = (item: RequestItem) => {
    const existing = requestItems.find((i) => i.productId === item.productId);
    if (existing) {
      setRequestItems(
        requestItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        ),
      );
      toast.success(`${item.productName} ditambahkan ke request`);
    } else {
      setRequestItems([...requestItems, item]);
      toast.success(`${item.productName} ditambahkan ke request`);
    }
  };

  const handleUpdateItem = (productId: string, newQuantity: number) => {
    setRequestItems(
      requestItems.map((i) =>
        i.productId === productId ? { ...i, quantity: newQuantity } : i,
      ),
    );
    toast.info("Jumlah diperbarui");
  };

  const handleRemoveItem = (productId: string) => {
    setRequestItems(requestItems.filter((i) => i.productId !== productId));
    toast.info("Item dihapus dari request");
  };

  const handleSubmit = () => {
    toast.success(`Request stok dari ${currentBranch.name} berhasil dikirim!`, {
      description: `${requestItems.length} item berhasil di-request`,
    });
    setRequestItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Request Stok</h1>
        <p className="text-muted-foreground">
          Request stok produk dari pusat ke {currentBranch.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RequestForm onAddItem={handleAddItem} />
        <StockList />
      </div>

      <RequestSummary
        items={requestItems}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
