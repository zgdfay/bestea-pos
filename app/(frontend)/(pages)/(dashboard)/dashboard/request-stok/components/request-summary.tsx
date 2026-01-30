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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Trash2, Pencil, Check, X } from "lucide-react";

export interface RequestItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface RequestSummaryProps {
  items: RequestItem[];
  onUpdateItem: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onSubmit: () => void;
}

export function RequestSummary({
  items,
  onUpdateItem,
  onRemoveItem,
  onSubmit,
}: RequestSummaryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const startEdit = (item: RequestItem) => {
    setEditingId(item.productId);
    setEditValue(item.quantity.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (productId: string) => {
    const newQuantity = parseInt(editValue);
    if (newQuantity > 0) {
      onUpdateItem(productId, newQuantity);
    }
    setEditingId(null);
    setEditValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Request</CardTitle>
        <CardDescription>{items.length} item dalam request</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada item dalam request. Tambahkan produk di atas.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === item.productId ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-8 text-right ml-auto"
                          min="1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(item.productId);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                      ) : (
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {editingId === item.productId ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveEdit(item.productId)}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(item)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveItem(item.productId)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={onSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim Request ke Pusat
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
