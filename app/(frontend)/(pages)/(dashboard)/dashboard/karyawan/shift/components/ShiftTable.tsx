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

// Helper to calculate total hours from shifts
const SHIFT_HOURS: Record<string, number> = {
  Pagi: 7, // 08:00 - 15:00 = 7 hours
  Sore: 7, // 15:00 - 22:00 = 7 hours
  Office: 8, // 09:00 - 17:00 = 8 hours
  Libur: 0,
};

const calculateWeeklyHours = (
  shifts: { type: string; time: string }[],
): number => {
  if (!shifts) return 0;
  return shifts.reduce((total, shift) => {
    return total + (SHIFT_HOURS[shift.type] || 0);
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
          {employees.map((emp) => (
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
                    <span className="text-[9px] opacity-70">{shift.time}</span>
                  </div>
                </TableCell>
              ))}
              <TableCell className="text-right text-xs font-semibold">
                {calculateWeeklyHours(employeeShifts[emp.id])}h
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
