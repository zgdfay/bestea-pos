"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Plus } from "lucide-react";
import { AddExpenseModal } from "./components/add-expense-modal";
import { ReportSummary } from "./components/report-summary";
import { ExpensesTable } from "./components/expenses-table";
import { TopProducts } from "./components/top-products";
import { useTransactions } from "@/app/context/transaction-context";

// Hardcode branches for now or use BranchContext
const branches = ["Semua Cabang", "Cabang Bangil", "Cabang Pasuruan"];

export default function LaporanPage() {
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [dateRange, setDateRange] = useState("Hari Ini");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const {
    getExpensesByBranch,
    getTransactionsByBranch,
    getTopProducts,
    addExpense,
  } = useTransactions();

  // ... existing code ...

  const handleAddExpense = (data: {
    category: string;
    amount: number;
    description: string;
    branchId: string;
    branchName: string;
  }) => {
    // Map category string to union type defined in Context if needed, or cast it.
    // The Context defines: category: "Operasional" | "Bahan Baku" | "Gaji" | "Sewa" | "Lainnya";
    addExpense({
      ...data,
      category: data.category as any,
      recordedBy: "Admin", // Hardcode Admin for dashboard input
    });
  };

  // Get data based on filter
  const rawExpenses = getExpensesByBranch(selectedBranch);
  const expenses = rawExpenses.map((e) => ({
    id: e.id,
    date: new Date(e.date).toLocaleDateString("id-ID"),
    category: e.category,
    note: e.description,
    amount: e.amount,
    branch: e.branchName,
    employeeName: e.recordedBy,
  }));

  const transactions = getTransactionsByBranch(selectedBranch);
  const topProducts = getTopProducts(5, selectedBranch);

  // Calculate totals
  const totalOmzet = transactions.reduce(
    (acc, t) => (t.status === "completed" ? acc + t.totalAmount : acc),
    0,
  );
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalTransactions = transactions.filter(
    (t) => t.status === "completed",
  ).length;

  // Format TopProducts for component
  const formattedTopProducts = topProducts.map((p, i) => ({
    id: `tp-${i}`,
    name: p.name,
    category: "Drink", // Simplified
    sold: p.sold,
    revenue: p.revenue,
    trend: "up" as const, // Mock trend
  }));

  // Export handler
  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Tanggal",
      "Kategori",
      "Keterangan",
      "Cabang",
      "Staff",
      "Jumlah",
    ];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      e.note,
      e.branch,
      e.employeeName,
      e.amount.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-keuangan-${dateRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onConfirm={handleAddExpense}
        branches={branches}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-muted-foreground">
            Monitor performa bisnis dan pengeluaran operasional
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Input Pengeluaran
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ReportSummary
        omzet={totalOmzet}
        expenses={totalExpenses}
        transactions={totalTransactions}
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">Cabang:</span>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent position="popper">
              {branches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">
            Periode:
          </span>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="Hari Ini">Hari Ini</SelectItem>
              <SelectItem value="Kemarin">Kemarin</SelectItem>
              <SelectItem value="Minggu Ini">Minggu Ini</SelectItem>
              <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Expenses Table */}
          <ExpensesTable expenses={expenses} />
        </div>
        <div>
          {/* Top Products */}
          <TopProducts products={formattedTopProducts} />
        </div>
      </div>
    </div>
  );
}
