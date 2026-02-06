"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    category: string;
    amount: number;
    description: string;
    branchId: string;
    branchName: string;
  }) => void;
  branches: string[];
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  branches,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Operasional");
  const [selectedBranch, setSelectedBranch] = useState("");

  const handleSubmit = () => {
    if (!amount || !description) return;

    onConfirm({
      category,
      amount: parseInt(amount),
      description,
      branchId: "manual-input", // Mock ID for now
      branchName: selectedBranch,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setCategory("Operasional");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Pengeluaran</DialogTitle>
          <DialogDescription>
            Catat pengeluaran operasional baru.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="branch">Cabang</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent position="popper">
                {branches.map(
                  (b) =>
                    // Filter out "Semua Cabang" if present, or handle logic in parent
                    b !== "Semua Cabang" && (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Operasional">Operasional</SelectItem>
                <SelectItem value="Bahan Baku">Bahan Baku</SelectItem>
                <SelectItem value="Gaji">Gaji</SelectItem>
                <SelectItem value="Sewa">Sewa</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Beli Es Batu tambahan"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || !description || !selectedBranch}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
