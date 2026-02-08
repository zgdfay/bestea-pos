"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Check, Loader2 } from "lucide-react";
import { useBranch } from "@/contexts/branch-context";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface PinEntryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (employee: {
    id: string;
    name: string;
    role: string;
    branch: string;
  }) => void;
  branchName: string;
  title?: string;
  description?: string;
}

export function PinEntryModal({
  isOpen,
  onOpenChange,
  onSuccess,
  branchName,
  title = "Masukkan PIN Karyawan",
  description = "Masukkan PIN 4 digit untuk melanjutkan",
}: PinEntryModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyPin } = useBranch();
  const inputRef = useRef<HTMLInputElement>(null);

  const PIN_LENGTH = 4;

  // Reset state when modal opens and focus input
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError(`PIN harus ${PIN_LENGTH} digit`);
      return;
    }

    setIsVerifying(true);

    try {
      const employee = await verifyPin(pin);

      if (employee) {
        toast.success(`Selamat datang, ${employee.name}!`);
        onSuccess({
          id: employee.id,
          name: employee.name,
          role: employee.role,
          branch: employee.branch,
        });
      } else {
        setError("PIN tidak valid atau karyawan tidak aktif");
        setPin("");
        inputRef.current?.focus();
      }
    } catch (e) {
      setError("Terjadi kesalahan verifikasi");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === PIN_LENGTH) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-green-100">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* PIN Input */}
          <div className="mb-4">
            <Input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              value={pin}
              onChange={handlePinChange}
              onKeyDown={handleKeyDown}
              placeholder="Masukkan PIN"
              className="h-14 text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:text-sm"
              autoFocus
            />
          </div>

          {/* PIN Dots Display */}
          <div className="flex justify-center gap-3 mb-4">
            {[...Array(PIN_LENGTH)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? "bg-green-500 scale-110" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={pin.length !== PIN_LENGTH || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Konfirmasi
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
