"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ShiftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    empId: string;
    dayIdx: number;
    type: string;
    startTime: string;
    endTime: string;
  }) => void;
  employees: any[];
  days: string[];
  shiftColors: Record<string, string>;
  selectedData: {
    empId: string;
    dayIdx: number;
    type: string;
    time: string;
  } | null;
}

export function ShiftModal({
  isOpen,
  onOpenChange,
  onSave,
  employees,
  days,
  shiftColors,
  selectedData,
}: ShiftModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedShiftType, setSelectedShiftType] = useState("Pagi");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");

  useEffect(() => {
    if (selectedData) {
      setSelectedEmpId(selectedData.empId);
      setSelectedDayIdx(selectedData.dayIdx);
      setSelectedShiftType(selectedData.type);

      if (selectedData.time !== "-") {
        const [start, end] = selectedData.time.split(" - ");
        setStartTime(start || "08:00");
        setEndTime(end || "16:00");
      } else {
        setStartTime("08:00");
        setEndTime("16:00");
      }
    }
  }, [selectedData, isOpen]);

  const handleSave = () => {
    onSave({
      empId: selectedEmpId,
      dayIdx: selectedDayIdx,
      type: selectedShiftType,
      startTime,
      endTime,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atur Jadwal Shift</DialogTitle>
          <DialogDescription>
            Pilih karyawan dan jenis shift untuk hari tertentu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="employee">Karyawan</Label>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger id="employee" className="w-full">
                <SelectValue placeholder="Pilih Karyawan" />
              </SelectTrigger>
              <SelectContent position="popper">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="day">Hari</Label>
            <Select
              value={selectedDayIdx.toString()}
              onValueChange={(v) => setSelectedDayIdx(parseInt(v))}
            >
              <SelectTrigger id="day" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {days.map((day, idx) => (
                  <SelectItem key={day} value={idx.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-4">
            <div className="grid gap-2">
              <Label htmlFor="shift">Jenis Shift</Label>
              <Select
                value={selectedShiftType}
                onValueChange={setSelectedShiftType}
              >
                <SelectTrigger id="shift" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Pagi">Pagi</SelectItem>
                  <SelectItem value="Sore">Sore</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Libur">Libur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className="grid gap-2">
              <Label>Status</Label>
              <Badge
                variant="outline"
                className={`justify-center h-9 ${shiftColors[selectedShiftType]}`}
              >
                {selectedShiftType}
              </Badge>
            </div> */}
          </div>

          {selectedShiftType !== "Libur" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Jam Mulai</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">Jam Selesai</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Simpan Jadwal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
