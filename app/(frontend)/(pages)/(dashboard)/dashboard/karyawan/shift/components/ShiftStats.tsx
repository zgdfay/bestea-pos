"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";

interface ShiftStatsProps {
  totalHours: number;
  employeeCount: number;
  employeesWithSchedule: number;
}

export function ShiftStats({
  totalHours,
  employeeCount,
  employeesWithSchedule,
}: ShiftStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Shift Minggu Ini
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours} Jam</div>
          <p className="text-xs text-muted-foreground">
            Total jam kerja semua karyawan
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Karyawan Aktif</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employeeCount} Orang</div>
          <p className="text-xs text-muted-foreground">
            {employeesWithSchedule} karyawan memiliki jadwal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
