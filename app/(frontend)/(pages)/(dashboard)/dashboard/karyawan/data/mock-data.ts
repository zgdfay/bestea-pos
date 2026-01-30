"use client";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  status: "active" | "inactive";
  joinDate: string;
  baseSalary: number;
  hourlyRate: number;
  pin: string; // 4-6 digit PIN for kasir authentication
}

export const initialEmployees: Employee[] = [
  {
    id: "EMP001",
    name: "Faayy",
    email: "faayy@bestea.com",
    phone: "08123456789",
    role: "Kasir",
    branch: "Cabang Bangil",
    status: "active",
    joinDate: "12 Jan 2024",
    baseSalary: 1500000,
    hourlyRate: 15000,
    pin: "1234",
  },
  {
    id: "EMP002",
    name: "Rina Amelia",
    email: "rina@bestea.com",
    phone: "08129876543",
    role: "Kasir",
    branch: "Cabang Pasuruan",
    status: "active",
    joinDate: "15 Jan 2024",
    baseSalary: 1500000,
    hourlyRate: 15000,
    pin: "5678",
  },
  {
    id: "EMP003",
    name: "Budi Santoso",
    email: "budi@bestea.com",
    phone: "08561234567",
    role: "Admin Cabang",
    branch: "Cabang Bangil",
    status: "active",
    joinDate: "01 Jan 2024",
    baseSalary: 2500000,
    hourlyRate: 20000,
    pin: "9999",
  },
  {
    id: "EMP004",
    name: "Siti Rahma",
    email: "siti@bestea.com",
    phone: "08778899001",
    role: "Kasir",
    branch: "Cabang Pasuruan",
    status: "inactive",
    joinDate: "20 Jan 2024",
    baseSalary: 1500000,
    hourlyRate: 15000,
    pin: "4321",
  },
];

export const branches = ["Cabang Bangil", "Cabang Pasuruan"];
// Permissions Definitions
export const permissions = [
  { id: "dash_view", label: "View Dashboard Analytics", category: "Dashboard" },
  {
    id: "prod_manage",
    label: "Manage Products & Categories",
    category: "Produk",
  },
  { id: "stock_manage", label: "Manage Stock & Inventory", category: "Produk" },
  { id: "pos_access", label: "Access POS System (Buka Kasir)", category: "Halaman Kasir" },
  {
    id: "trans_history",
    label: "View Transaction History",
    category: "Transaksi",
  },
  {
    id: "emp_manage",
    label: "Manage Employees & Shifts",
    category: "Karyawan",
  },
  { id: "report_view", label: "View Financial Reports", category: "Laporan" },
  { id: "settings", label: "Access Settings", category: "Pengaturan" },
];

export const roles = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Akses penuh ke seluruh sistem pusat dan cabang.",
    users: 1,
    color: "bg-red-100 text-red-700 border-red-200",
    perms: [
      "dash_view",
      "prod_manage",
      "stock_manage",
      "pos_access",
      "trans_history",
      "emp_manage",
      "report_view",
      "settings",
    ],
  },
  {
    id: "branch_admin",
    name: "Admin Cabang",
    description: "Mengelola operasional satu cabang tertentu.",
    users: 3,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    perms: [
      "dash_view",
      "stock_manage",
      "trans_history",
      "emp_manage",
      "report_view",
    ],
  },
  {
    id: "cashier",
    name: "Kasir",
    description: "Fokus pada operasional POS dan transaksi harian.",
    users: 12,
    color: "bg-green-100 text-green-700 border-green-200",
    perms: ["pos_access", "trans_history"],
  },
];

export const statusConfig = {
  active: {
    label: "Aktif",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  inactive: {
    label: "Non-Aktif",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};
