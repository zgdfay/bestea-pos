"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/contexts/branch-context";
import { toast } from "sonner";
import { Clock, LogOut, Coffee } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AttendanceButton() {
  const {
    activeEmployee,
    checkAttendanceStatus,
    clockIn,
    clockOut,
    currentBranch,
    userRole,
  } = useBranch();
  const [status, setStatus] = useState<
    "clocked_in" | "clocked_out" | "loading"
  >("loading");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      if (activeEmployee?.id) {
        try {
          const record = await checkAttendanceStatus(activeEmployee.id);
          if (mounted) {
            if (record && !record.check_out) {
              setStatus("clocked_in");
              setRecordId(record.id);
              setCheckInTime(record.check_in);
            } else {
              setStatus("clocked_out");
              setRecordId(null);
              setCheckInTime(null);
            }
          }
        } catch (error) {
          console.error("Failed to check status", error);
          if (mounted) setStatus("clocked_out"); // Default/Safe state
        }
      } else {
        if (mounted) setStatus("clocked_out");
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, [activeEmployee?.id, checkAttendanceStatus]);

  const handleClockIn = async () => {
    if (!activeEmployee || !currentBranch) {
      toast.error("Data karyawan atau cabang tidak valid");
      return;
    }

    setStatus("loading");
    try {
      // Determine shift based on time (simple logic for now)
      const hour = new Date().getHours();
      const shift = hour < 15 ? "Pagi" : "Sore";

      await clockIn(activeEmployee.id, currentBranch.id, shift);
      toast.success("Berhasil Clock In", { description: "Selamat bekerja!" });
      setStatus("clocked_in");
      setCheckInTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error: any) {
      toast.error("Gagal Clock In", { description: error.message });
      setStatus("clocked_out");
    }
  };

  const handleClockOut = async () => {
    if (!activeEmployee) return;

    setStatus("loading");
    try {
      await clockOut(activeEmployee.id);
      toast.success("Berhasil Clock Out", {
        description: "Terima kasih atas kerja keras Anda!",
      });
      setStatus("clocked_out");
      setCheckInTime(null);
      setRecordId(null);
    } catch (error: any) {
      toast.error("Gagal Clock Out", { description: error.message });
      setStatus("clocked_in");
    }
  };

  if (!activeEmployee) return null;

  // Super Admin doesn't need attendance tracking
  if (userRole === "super_admin") return null;

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled className="h-7 w-7">
        <Clock className="h-4 w-4 animate-pulse text-muted-foreground" />
      </Button>
    );
  }

  if (status === "clocked_in") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-7 gap-2 bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-green-200 border transition-colors group"
              onClick={handleClockOut}
            >
              <Clock className="h-3.5 w-3.5 group-hover:hidden" />
              <LogOut className="h-3.5 w-3.5 hidden group-hover:block" />
              <span className="text-xs font-medium group-hover:hidden">
                {checkInTime}
              </span>
              <span className="text-xs font-medium hidden group-hover:inline">
                Clock Out
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clock Out (Masuk: {checkInTime})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-2 text-slate-500 hover:text-green-600 hover:bg-green-50 border-slate-200"
            onClick={handleClockIn}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Clock In</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mulai Shift</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
