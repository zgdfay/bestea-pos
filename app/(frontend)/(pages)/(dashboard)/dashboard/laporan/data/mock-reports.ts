export interface DailyStat {
  date: string;
  omzet: number;
  expenses: number;
  transactions: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  branch: string; // Branch Name
  employeeName: string;
  category: "Operasional" | "Bahan Baku" | "Lainnya";
  note: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

export const mockDailyStats: DailyStat[] = [
  { date: "2024-01-28", omzet: 2500000, expenses: 150000, transactions: 120 },
  { date: "2024-01-29", omzet: 3100000, expenses: 500000, transactions: 145 },
  { date: "2024-01-30", omzet: 2800000, expenses: 0, transactions: 130 },
  { date: "2024-02-01", omzet: 1500000, expenses: 200000, transactions: 75 }, // Today partial
];

export const mockExpenses: ExpenseRecord[] = [
  {
    id: "EXP-001",
    date: "2024-02-01 10:30",
    branch: "Cabang Bangil",
    employeeName: "Faayy",
    category: "Bahan Baku",
    note: "Beli Es Batu Kristal 5 Sak",
    amount: 50000,
  },
  {
    id: "EXP-002",
    date: "2024-02-01 13:15",
    branch: "Cabang Pasuruan",
    employeeName: "Rina",
    category: "Operasional",
    note: "Beli Galon 2 Pcs",
    amount: 10000,
  },
  {
    id: "EXP-003",
    date: "2024-01-29 19:00",
    branch: "Cabang Bangil",
    employeeName: "Faayy",
    category: "Lainnya",
    note: "Uang Kebersihan Sampah",
    amount: 15000,
  },
];

export const mockTopProducts: TopProduct[] = [
  { id: "1", name: "Brown Sugar Boba Milk", category: "Tea Series", sold: 150, revenue: 2700000 },
  { id: "2", name: "Green Tea Jasmine", category: "Tea Series", sold: 120, revenue: 1200000 },
  { id: "3", name: "Chocolate Hazelnut", category: "Milk Series", sold: 95, revenue: 1710000 },
  { id: "4", name: "Mango Yakult", category: "Fruit Series", sold: 80, revenue: 1440000 },
  { id: "5", name: "Matcha Latte", category: "Milk Series", sold: 65, revenue: 1170000 },
];
