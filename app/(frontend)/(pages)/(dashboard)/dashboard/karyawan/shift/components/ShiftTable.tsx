"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShiftTableProps {
  employees: any[];
  employeeShifts: Record<string, { type: string; time: string }[]>;
  days: string[];
  shiftColors: Record<string, string>;
  onCellClick: (empId: string, dayIdx: number) => void;
}

// Helper to calculate weekly hours dynamically from shift times
const calculateWeeklyHours = (
  shifts: { type: string; time: string }[],
): number => {
  if (!shifts) return 0;

  return shifts.reduce((total, shift) => {
    if (shift.type === "Libur" || shift.time === "-") return total;

    try {
      const [startPart, endPart] = shift.time.split(" - ");
      if (!startPart || !endPart) return total;

      const [startH, startM] = startPart.split(":").map(Number);
      const [endH, endM] = endPart.split(":").map(Number);

      let diffMins = endH * 60 + endM - (startH * 60 + startM);
      if (diffMins < 0) diffMins += 24 * 60; // Midnight crossing

      return total + diffMins / 60;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return total;
    }
  }, 0);
};

export function ShiftTable({
  employees,
  employeeShifts,
  days,
  shiftColors,
  onCellClick,
}: ShiftTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Karyawan</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="text-center w-[140px]">
                {day}
              </TableHead>
            ))}
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={days.length + 2}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada karyawan. Tambahkan karyawan terlebih dahulu.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {emp.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {emp.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                {employeeShifts[emp.id]?.map((shift, idx) => (
                  <TableCell key={idx} className="text-center p-2">
                    <div
                      onClick={() => onCellClick(emp.id, idx)}
                      className={`flex flex-col gap-0.5 py-1.5 rounded-md border text-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all ${shiftColors[shift.type] || shiftColors["Libur"]}`}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {shift.type}
                      </span>
                      <span className="text-[9px] opacity-70">
                        {shift.time}
                      </span>
                    </div>
                  </TableCell>
                ))}
                <TableCell className="text-right text-xs font-semibold">
                  {calculateWeeklyHours(employeeShifts[emp.id])}h
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
