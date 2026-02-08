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
import { useBranch } from "@/contexts/branch-context";
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

// Shift time configuration (in 24-hour format)
const SHIFT_TIMES = {
  Pagi: { start: 8, end: 15 }, // 08:00 - 15:00
  Sore: { start: 15, end: 22 }, // 15:00 - 22:00
} as const;

const LATE_TOLERANCE_MINUTES = 15; // 15 minutes tolerance

// Helper to check if employee is late
const isLate = (shift: "Pagi" | "Sore"): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const shiftStart = SHIFT_TIMES[shift].start;

  // Compare: if current time > shift start + tolerance
  const totalMinutesNow = currentHour * 60 + currentMinutes;
  const shiftStartMinutes = shiftStart * 60 + LATE_TOLERANCE_MINUTES;

  return totalMinutesNow > shiftStartMinutes;
};

// Helper to get current shift based on time
const getCurrentShift = (): "Pagi" | "Sore" => {
  const hour = new Date().getHours();
  // Before 15:00 = Pagi, 15:00 or after = Sore
  return hour < 15 ? "Pagi" : "Sore";
};

// Helper to get local date string YYYY-MM-DD
const getLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to get Monday of the current week in YYYY-MM-DD format (Local Time)
const getWeekStart = (): string => {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day; // Days to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return getLocalYYYYMMDD(monday);
};

// Helper to get day index (0 = Monday, 6 = Sunday)
const getDayIndex = (): number => {
  const day = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  return day === 0 ? 6 : day - 1; // Convert to 0 = Monday
};

// Check if employee has a schedule for today
const checkEmployeeSchedule = async (
  employeeId: string,
): Promise<{ hasSchedule: boolean; shiftType: string | null }> => {
  try {
    const weekStart = getWeekStart();
    const dayIndex = getDayIndex();

    // Add cache: 'no-store' to prevent caching
    const response = await fetch(
      `/api/shift-schedules?week_start=${weekStart}&employee_id=${employeeId}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }

    const schedules = await response.json();
    console.log("Debug Schedule Check:", { weekStart, dayIndex, schedules });

    // Find today's schedule
    const todaySchedule = schedules.find(
      (s: any) => s.day_of_week === dayIndex,
    );

    console.log("Today Schedule Found:", todaySchedule);

    if (!todaySchedule || todaySchedule.shift_type === "Libur") {
      return {
        hasSchedule: false,
        shiftType: todaySchedule?.shift_type || null,
      };
    }

    return { hasSchedule: true, shiftType: todaySchedule.shift_type };
  } catch (error) {
    console.error("Error checking schedule:", error);
    return { hasSchedule: false, shiftType: null };
  }
};

// Check if employee already checked in today
const checkAlreadyCheckedIn = async (employeeId: string): Promise<boolean> => {
  try {
    const today = getLocalYYYYMMDD(new Date());

    const response = await fetch(
      `/api/attendance?employee_id=${employeeId}&date=${today}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return false; // Assume not checked in if API fails
    }

    const records = await response.json();

    // If there's any record for today, they've already checked in
    return records.length > 0;
  } catch (error) {
    console.error("Error checking attendance:", error);
    return false;
  }
};

interface ShiftModalProps {
  isOpen: boolean;
  mode: "open" | "close";
  onOpenChange: (open: boolean) => void;
}

export function ShiftModal({ isOpen, mode, onOpenChange }: ShiftModalProps) {
  const router = useRouter();
  const { openShift, closeShift, shiftData } = useShift();
  const { clockIn, clockOut, currentBranch, setActiveEmployee } = useBranch();
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

  const handleSubmit = async () => {
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

      // Check if employee has schedule for today
      const dayNames = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
      ];
      const todayName = dayNames[getDayIndex()];

      toast.loading("Memeriksa jadwal...", { id: "check-schedule" });
      const { hasSchedule, shiftType } = await checkEmployeeSchedule(
        pendingEmployee.id,
      );
      toast.dismiss("check-schedule");

      if (!hasSchedule) {
        const message =
          shiftType === "Libur"
            ? `${pendingEmployee.name} dijadwalkan LIBUR hari ini (${todayName}).`
            : `${pendingEmployee.name} tidak memiliki jadwal untuk hari ini (${todayName}).`;

        toast.error("Tidak Dapat Membuka Shift", {
          description:
            message + " Silakan hubungi Admin untuk mengatur jadwal.",
          duration: 3000,
        });

        // Redirect to login after short delay
        setTimeout(() => {
          // Reset context/state if needed or just redirect
          // We can use the context's logout if available, or just push to login
          // Using window.location to force full reload/clear state is safer for lockouts
          window.location.href = "/";
        }, 1500);

        return;
      }

      // Check if already checked in today
      const alreadyCheckedIn = await checkAlreadyCheckedIn(pendingEmployee.id);
      if (alreadyCheckedIn) {
        toast.info("Sudah Absen Hari Ini", {
          description: `${pendingEmployee.name} sudah melakukan absensi masuk hari ini.`,
          duration: 5000,
        });
        // Still allow opening shift, just skip clock-in
        openShift(value, pendingEmployee);
        toast.success("Shift berhasil dibuka!", {
          description: `${pendingEmployee.name} - (Absensi sudah tercatat sebelumnya)`,
          duration: 5000,
        });
        onOpenChange(false);
        return;
      }

      openShift(value, pendingEmployee);

      // Auto Clock In with late detection
      if (currentBranch) {
        const shift = getCurrentShift();
        const lateStatus = isLate(shift);
        const status = lateStatus ? "Terlambat" : "Hadir";

        clockIn(pendingEmployee.id, currentBranch.id, shift, status)
          .then(() => {
            if (lateStatus) {
              toast.warning("Absensi Masuk - TERLAMBAT", {
                description: `Shift ${shift} dimulai jam ${SHIFT_TIMES[shift].start}:00. Toleransi ${LATE_TOLERANCE_MINUTES} menit.`,
                duration: 6000,
              });
            } else {
              toast.success("Absensi Masuk Berhasil");
            }
          })
          .catch((err) => {
            console.error("Auto clock-in failed", err);
            toast.error("Gagal mencatat absensi masuk");
          });
      }

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
    console.log("[CloseShift] PIN verified for:", employee.name);
    setPendingEmployee(employee);
    setShowPinModal(false);
    setShowConfirm(true);
    console.log("[CloseShift] showConfirm set to true");
  };

  const handleConfirmClosure = () => {
    const value = parseNumber(amount);
    const expected = shiftData.expectedCash;
    const discrepancy = value - expected;

    if (!pendingEmployee) return;

    closeShift(value, pendingEmployee, notes);

    // Auto Clock Out - clock out the employee who OPENED the shift
    const employeeToClockOut = shiftData.openedBy?.id || pendingEmployee.id;
    clockOut(employeeToClockOut)
      .then(() => {
        toast.success("Absensi Pulang Berhasil");
      })
      .catch((err) => {
        console.error("Auto clock-out failed", err);
        // Don't show error if no clock-in record - just log it
        console.log("Clock out skipped - no clock-in record found");
      });

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
