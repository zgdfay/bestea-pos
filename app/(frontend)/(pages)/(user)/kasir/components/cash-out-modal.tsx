import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, AlertCircle } from "lucide-react";

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, description: string) => void;
}

export function CashOutModal({
  isOpen,
  onClose,
  onConfirm,
}: CashOutModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    if (!number) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(number));
  };

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/\./g, "") || "0");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatNumber(rawValue);
    setAmount(formatted);
  };

  const handleSubmit = () => {
    const value = parseNumber(amount);

    if (value <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }

    if (!description.trim()) {
      setError("Mohon isi keterangan pengeluaran.");
      return;
    }

    onConfirm(value, description);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            Catat Pengeluaran (Cash Out)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cash-out-amount">Jumlah Pengeluaran</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                Rp
              </span>
              <Input
                id="cash-out-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="pl-10 h-12 text-lg font-bold"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-out-desc">Keterangan</Label>
            <Input
              id="cash-out-desc"
              type="text"
              placeholder="Contoh: Beli Es Batu, Beli Gas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Simpan Pengeluaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
