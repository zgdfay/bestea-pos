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
  branches: { id: string; name: string }[];
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  branches,
}: AddExpenseModalProps) {
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    if (!amount || !description || !selectedBranchId || !category) return;

    const selectedBranch = branches.find((b) => b.id === selectedBranchId);

    onConfirm({
      category,
      amount: parseInt(amount),
      description,
      branchId: selectedBranchId,
      branchName: selectedBranch?.name || "Unknown",
    });

    onClose();
    // Reset form
    setAmount("");
    setDescription("");
    setSelectedBranchId("");
    setCategory("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pengeluaran operasional di sini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="branch" className="text-right">
              Cabang
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedBranchId}
                onValueChange={setSelectedBranchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori
            </Label>
            <div className="col-span-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operasional">Operasional</SelectItem>
                  <SelectItem value="Bahan Baku">Bahan Baku</SelectItem>
                  <SelectItem value="Gaji">Gaji</SelectItem>
                  <SelectItem value="Sewa">Sewa</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Jumlah
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Keterangan
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Deskripsi pengeluaran..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!amount || !description || !selectedBranchId || !category}
          >
            Simpan Pengeluaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
