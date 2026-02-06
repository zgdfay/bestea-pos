"use client";

import { useEffect, useState } from "react";
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
import { useShift, ShiftEmployee } from "../context/shift-context";
import { Banknote, AlertTriangle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PinEntryModal } from "./pin-entry-modal";
import { useEmployee } from "@/app/context/employee-context";

interface ShiftModalProps {
  isOpen: boolean;
  mode: "open" | "close";
  onOpenChange: (open: boolean) => void;
}

export function ShiftModal({ isOpen, mode, onOpenChange }: ShiftModalProps) {
  const router = useRouter();
  const { openShift, closeShift, shiftData } = useShift();
  const { setActiveEmployee } = useEmployee();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notes, setNotes] = useState("");

  // PIN Entry states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState<ShiftEmployee | null>(
    null,
  );
  const [step, setStep] = useState<"pin" | "amount">("pin");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
      setSummary(null);
      setShowConfirm(false);
      setNotes("");
      setPendingEmployee(null);
      // For opening shift, always require PIN first
      setStep(mode === "open" ? "pin" : "amount");
      if (mode === "open") {
        setShowPinModal(true);
      }
    }
  }, [isOpen, mode]);

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

  const handlePinSuccess = (employee: {
    id: string;
    name: string;
    role: string;
    branch: string;
  }) => {
    setPendingEmployee(employee);
    setShowPinModal(false);
    setStep("amount");
    // Set active employee
    setActiveEmployee(employee);
  };

  const handleSubmit = () => {
    const value = parseNumber(amount);

    if (value < 0) {
      setError("Mohon masukkan jumlah uang yang valid.");
      toast.error("Input tidak valid", {
        description: "Mohon masukkan jumlah uang yang valid.",
      });
      return;
    }

    if (mode === "open") {
      if (!pendingEmployee) {
        toast.error("Verifikasi PIN diperlukan");
        setShowPinModal(true);
        return;
      }
      openShift(value, pendingEmployee);
      const now = new Date();
      toast.success("Shift berhasil dibuka!", {
        description: `${pendingEmployee.name} - Absen Masuk: ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
        duration: 5000,
      });
      onOpenChange(false);
    } else {
      // For closing, require PIN confirmation
      setShowPinModal(true);
    }
  };

  const handleCloseShiftPinSuccess = (employee: {
    id: string;
    name: string;
    role: string;
    branch: string;
  }) => {
    setPendingEmployee(employee);
    setShowPinModal(false);
    setShowConfirm(true);
  };

  const handleConfirmClosure = () => {
    const value = parseNumber(amount);
    const expected = shiftData.expectedCash;
    const discrepancy = value - expected;

    if (!pendingEmployee) return;

    closeShift(value, pendingEmployee, notes);
    setSummary({
      actual: value,
      expected: expected,
      discrepancy: discrepancy,
      closedBy: pendingEmployee.name,
    });
    setShowConfirm(false);

    const now = new Date();
    toast.success("Shift berhasil ditutup!", {
      description: `${pendingEmployee.name} - Absen Pulang: ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      duration: 5000,
    });
  };

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  if (summary) {
    return (
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) onOpenChange(false);
        }}
      >
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Laporan Penutupan Kasir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {summary.closedBy && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <User className="h-4 w-4" />
                <span>
                  Ditutup oleh: <strong>{summary.closedBy}</strong>
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-slate-500">Uang Tunai Awal (Modal)</div>
              <div className="font-medium text-right">
                {formatter.format(shiftData.initialCash)}
              </div>

              <div className="text-slate-500">Total Penjualan Tunai</div>
              <div className="font-medium text-right text-green-600">
                +{formatter.format(shiftData.totalCashTransactions)}
              </div>

              <div className="text-slate-500">Total Pengeluaran</div>
              <div className="font-medium text-right text-red-600">
                -{formatter.format(shiftData.totalExpenses || 0)}
              </div>

              <div className="text-slate-500 font-bold border-t pt-2">
                Seharusnya di Laci
              </div>
              <div className="font-bold text-right border-t pt-2">
                {formatter.format(summary.expected)}
              </div>

              <div className="text-slate-500 font-bold">Aktual di Laci</div>
              <div className="font-bold text-right text-blue-600">
                {formatter.format(summary.actual)}
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${summary.discrepancy === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle
                  className={`h-4 w-4 ${summary.discrepancy === 0 ? "text-green-600" : "text-red-600"}`}
                />
                <span
                  className={`font-bold ${summary.discrepancy === 0 ? "text-green-700" : "text-red-700"}`}
                >
                  {summary.discrepancy === 0
                    ? "Balance (Seimbang)"
                    : "Selisih (Discrepancy)"}
                </span>
              </div>
              <p
                className={`text-xl font-black ${summary.discrepancy === 0 ? "text-green-700" : "text-red-700"}`}
              >
                {summary.discrepancy > 0 ? "+" : ""}
                {formatter.format(summary.discrepancy)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/login");
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Log Out & Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* PIN Entry Modal */}
      <PinEntryModal
        isOpen={showPinModal}
        onOpenChange={(open) => {
          setShowPinModal(open);
          if (!open && mode === "open" && !pendingEmployee) {
            // If PIN modal closed without employee in open mode, close the whole modal
            onOpenChange(false);
          }
        }}
        onSuccess={
          mode === "open" ? handlePinSuccess : handleCloseShiftPinSuccess
        }
        branchName={shiftData.branchName}
        title={mode === "open" ? "Verifikasi Karyawan" : "Konfirmasi PIN"}
        description={
          mode === "open"
            ? "Masukkan PIN untuk memulai shift"
            : "Masukkan PIN untuk menutup shift"
        }
      />

      <Dialog
        open={isOpen && step === "amount"}
        onOpenChange={(open) => {
          if (mode === "open" && !open) return;
          onOpenChange(open);
        }}
      >
        <DialogContent
          className={`sm:max-w-md ${mode === "open" ? "[&>button]:hidden" : ""}`}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <Banknote className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <DialogTitle className="text-center text-xl">
              {mode === "open" ? "Buka Kasir" : "Tutup Kasir"}
            </DialogTitle>
            {pendingEmployee && mode === "open" && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2 mt-2">
                <User className="h-4 w-4" />
                <span>
                  Kasir: <strong>{pendingEmployee.name}</strong>
                </span>
              </div>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500 text-center">
              {mode === "open"
                ? "Masukkan jumlah uang modal awal yang ada di laci kasir."
                : "Hitung dan masukkan total uang tunai yang ada di laci saat ini."}
            </p>

            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold text-slate-700">
                {mode === "open" ? "Modal Awal" : "Total Uang di Laci"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  Rp
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="pl-10 h-12 text-lg font-bold"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              {mode === "open" ? "Buka Shift" : "Tutup Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Tutup Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin jumlah uang di laci sudah benar? Data ini akan
              dicatat dan shift akan segera ditutup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmClosure}
            >
              Ya, Sudah Benar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
