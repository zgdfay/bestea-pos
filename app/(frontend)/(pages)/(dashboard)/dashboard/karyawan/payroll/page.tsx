"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Wallet,
  Clock,
  TrendingUp,
  Search,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";
import { initialEmployees } from "../data/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function PayrollPage() {
  const [employees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("Januari");

  // Mock calculation: let's assume everyone worked 160 hours + some bonus
  const [payrollData, setPayrollData] = useState(() =>
    employees.map((emp) => {
      const hours = emp.id === "EMP001" ? 172 : 160;
      const totalHourly = hours * emp.hourlyRate;
      const totalSalary = emp.baseSalary + totalHourly;
      return {
        ...emp,
        hours,
        totalHourly,
        totalSalary,
        status: "Draft", // Initial status
      };
    }),
  );

  const handlePay = (id: string) => {
    setPayrollData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paid" } : p)),
    );
    toast.success("Gaji Berhasil Dibayarkan", {
      description: "Status payroll telah diperbarui menjadi Paid.",
    });
  };

  const filteredPayroll = payrollData.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Rekap Gaji (Payroll)
          </h1>
          <p className="text-muted-foreground">
            Rekapitulasi jam kerja dan perhitungan gaji karyawan
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payrollData.reduce((acc, p) => acc + p.totalSalary, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Periode {monthFilter} 2024
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jam Kerja
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollData.reduce((acc, p) => acc + p.hours, 0)} Jam
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata 164 jam/karyawan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trend Pengeluaran
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2.4%</div>
            <p className="text-xs text-muted-foreground">Dari bulan Desember</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rincian Gaji</CardTitle>
              <CardDescription>
                Detail perhitungan gaji berdasarkan jam kerja
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari karyawan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Januari">Januari</SelectItem>
                  <SelectItem value="Februari">Februari</SelectItem>
                  <SelectItem value="Maret">Maret</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead className="text-center">Jam Kerja</TableHead>
                <TableHead>Gaji Pokok</TableHead>
                <TableHead>Total Jam (Rp)</TableHead>
                <TableHead className="text-right">Total Diterima</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {p.hours}h
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(p.baseSalary)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(p.totalHourly)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-700">
                    {formatCurrency(p.totalSalary)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        p.status === "Paid"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePay(p.id)}
                          disabled={p.status === "Paid"}
                          className={
                            p.status === "Paid"
                              ? "opacity-50 cursor-not-allowed"
                              : "text-green-600"
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
