"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon, Download, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { id } from "date-fns/locale/id";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

import {
  initialEmployees,
  statusConfig as employeeStatusConfig,
} from "../data/mock-data";

// Mock data absensi
const initialAttendance = [
  {
    id: "ATT-001",
    employeeId: "EMP001",
    employeeName: "Faayy",
    role: "Kasir",
    date: new Date(),
    checkIn: "08:15", // Terlambat jika target 08:00
    targetCheckIn: "08:00",
    checkOut: "-",
    status: "late",
    shift: "Pagi",
    branch: "Cabang Bangil",
  },
  {
    id: "ATT-002",
    employeeId: "EMP002",
    employeeName: "Rina Amelia",
    role: "Kasir",
    date: new Date(),
    checkIn: "08:00",
    targetCheckIn: "08:00",
    checkOut: "-",
    status: "present",
    shift: "Pagi",
    branch: "Cabang Pasuruan",
  },
  {
    id: "ATT-003",
    employeeId: "EMP003",
    employeeName: "Budi Santoso",
    role: "Admin Cabang",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    checkIn: "07:55",
    targetCheckIn: "08:00",
    checkOut: "16:00",
    status: "present",
    shift: "Pagi",
    branch: "Cabang Bangil",
  },
];

const statusConfig = {
  present: { label: "Hadir", className: "bg-green-100 text-green-700" },
  late: { label: "Terlambat", className: "bg-yellow-100 text-yellow-700" },
  absent: { label: "Alpa", className: "bg-red-100 text-red-700" },
  sick: { label: "Sakit", className: "bg-blue-100 text-blue-700" },
  leave: { label: "Izin/Cuti", className: "bg-purple-100 text-purple-700" },
};

export default function AdminAbsensiPage() {
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendance);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manual Input State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("sick");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const handleManualInput = () => {
    if (!selectedEmployee || !startDate) {
      toast.error("Harap lengkapi semua data");
      return;
    }

    const newRecord = {
      id: `ATT-${Date.now().toString().slice(-3)}`,
      employeeId: selectedEmployee === "Faayy" ? "EMP001" : "EMP002",
      employeeName: selectedEmployee,
      role: selectedEmployee === "Budi Santoso" ? "Admin Cabang" : "Kasir",
      date: startDate,
      checkIn: "-",
      targetCheckIn: "08:00",
      checkOut: "-",
      status: leaveType,
      shift: "Pagi",
      branch:
        selectedEmployee === "Budi Santoso"
          ? "Cabang Bangil"
          : "Cabang Pasuruan",
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);
    setIsModalOpen(false);
    toast.success("Absensi manual berhasil dicatat", {
      description: `${selectedEmployee} status: ${leaveType}`,
    });

    // Reset Form
    setSelectedEmployee("");
    setLeaveType("sick");
    setReason("");
  };

  const filteredData = attendanceRecords.filter((item) => {
    const matchSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;

    // Filter date simple logic (match day)
    const matchDate = date
      ? item.date.getDate() === date.getDate() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getFullYear() === date.getFullYear()
      : true;

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Absensi</h1>
          <p className="text-muted-foreground">
            Laporan kehadiran karyawan di semua cabang
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Input Izin/Sakit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Input Absensi Manual</DialogTitle>
                <DialogDescription>
                  Gunakan ini untuk mencatat Izin, Sakit, atau Cuti karyawan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="employee">Pilih Karyawan</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger id="employee" className="w-full">
                      <SelectValue placeholder="Pilih Karyawan" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {initialEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.name}>
                          {emp.name} ({emp.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipe Absensi</Label>
                    <Select value={leaveType} onValueChange={setLeaveType}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="sick">Sakit</SelectItem>
                        <SelectItem value="leave">Izin/Cuti</SelectItem>
                        <SelectItem value="absent">Alpa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {startDate ? format(startDate, "dd/MM/yy") : "Pilih"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reason">Alasan/Keterangan</Label>
                  <Textarea
                    id="reason"
                    placeholder="Contoh: Demam, Keperluan Keluarga..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleManualInput}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Simpan Absensi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Tampilkan data absensi berdasarkan tanggal, nama, atau status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama karyawan atau cabang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full sm:w-[240px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: id })
                    ) : (
                      <span>Pilih Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status Kehadiran" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="present">Hadir</SelectItem>
                  <SelectItem value="late">Terlambat</SelectItem>
                  <SelectItem value="sick">Sakit</SelectItem>
                  <SelectItem value="leave">Izin/Cuti</SelectItem>
                  <SelectItem value="absent">Alpa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead className="text-center">Tanggal</TableHead>
                <TableHead className="text-center">Shift</TableHead>
                <TableHead className="text-center">Jam Masuk</TableHead>
                <TableHead className="text-center">Jam Pulang</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.employeeName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.branch}</TableCell>
                    <TableCell className="text-center">
                      {format(item.date, "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground italic">
                      {item.shift}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.checkIn}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {item.checkOut}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`w-24 justify-center ${
                          statusConfig[item.status as keyof typeof statusConfig]
                            ?.className
                        }`}
                      >
                        {
                          statusConfig[item.status as keyof typeof statusConfig]
                            ?.label
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data absensi ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
