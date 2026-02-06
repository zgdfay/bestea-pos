"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";

// Types
export interface TransactionItem {
  productId: string;
  productName: string;
  variant?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  branchId: string;
  branchName: string; // Stored for easier reporting
  cashierId?: string;
  cashierName: string;
  customerName?: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: "cash" | "qris" | "debit";
  status: "completed" | "void";
}

export interface Expense {
  id: string;
  date: string;
  branchId: string;
  branchName: string;
  category: "Operasional" | "Bahan Baku" | "Gaji" | "Sewa" | "Lainnya";
  description: string;
  amount: number;
  recordedBy: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  expenses: Expense[];
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  addExpense: (expense: Omit<Expense, "id" | "date">) => void;
  getTransactionsByBranch: (branchName: string) => Transaction[];
  getExpensesByBranch: (branchName: string) => Expense[];
  getDailyRevenue: (date: Date, branchName?: string) => number;
  getMonthlyRevenue: (date: Date, branchName?: string) => number;
  getTotalRevenue: (branchName?: string) => number;
  getTopProducts: (
    limit?: number,
    branchName?: string,
  ) => { name: string; sold: number; revenue: number }[];
  getBranchPerformance: () => {
    branch: string;
    revenue: number;
    percentage: number;
  }[];
  getDailyStats: () => {
    revenue: number;
    revenueGrowth: number;
    transactions: number;
    transactionGrowth: number;
    activeBranches: number;
    productsSold: number;
    productGrowth: number;
  };
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

// Initial Mock Data to populate the dashboard immediately
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    date: new Date().toISOString(),
    branchId: "b-01",
    branchName: "Cabang Bangil",
    cashierName: "Budi",
    items: [
      {
        productId: "p1",
        productName: "Original Jasmine Tea",
        quantity: 2,
        price: 10000,
        subtotal: 20000,
      },
      {
        productId: "p2",
        productName: "Milk Tea",
        variant: "Large",
        quantity: 1,
        price: 15000,
        subtotal: 15000,
      },
    ],
    totalAmount: 35000,
    paymentMethod: "cash",
    status: "completed",
  },
  {
    id: "TRX-002",
    date: new Date().toISOString(),
    branchId: "b-02",
    branchName: "Cabang Pasuruan",
    cashierName: "Siti",
    items: [
      {
        productId: "p3",
        productName: "Chocolate Series",
        quantity: 3,
        price: 18000,
        subtotal: 54000,
      },
    ],
    totalAmount: 54000,
    paymentMethod: "qris",
    status: "completed",
  },
  // Add more historical data for charts if needed
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "EXP-001",
    date: new Date().toISOString(),
    branchId: "b-01",
    branchName: "Cabang Bangil",
    category: "Bahan Baku",
    description: "Beli Es Batu",
    amount: 50000,
    recordedBy: "Budi",
  },
];

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTrx = localStorage.getItem("bestea-transactions");
    if (savedTrx) {
      try {
        setTransactions(JSON.parse(savedTrx));
      } catch (e) {
        console.error(e);
      }
    }
    const savedExp = localStorage.getItem("bestea-expenses");
    if (savedExp) {
      try {
        setExpenses(JSON.parse(savedExp));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("bestea-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("bestea-expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Generate partial mock history if empty (for demo purposes)
  useEffect(() => {
    if (transactions.length <= 2) {
      const history: Transaction[] = [];
      const today = new Date();

      // Generate 30 days back
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random 3-8 transactions per day
        const dailyCount = Math.floor(Math.random() * 5) + 3;

        for (let j = 0; j < dailyCount; j++) {
          const isCash = Math.random() > 0.5;
          const amount = (Math.floor(Math.random() * 5) + 1) * 15000;

          history.push({
            id: `MOCK-${i}-${j}`,
            date: date.toISOString(),
            branchId: i % 2 === 0 ? "b-01" : "b-02",
            branchName: i % 2 === 0 ? "Cabang Bangil" : "Cabang Pasuruan",
            cashierName: i % 2 === 0 ? "Budi" : "Siti",
            items: [
              {
                productId: "p-mock",
                productName: "Mock Item",
                quantity: 1,
                price: amount,
                subtotal: amount,
              },
            ],
            totalAmount: amount,
            paymentMethod: isCash ? "cash" : "qris",
            status: "completed",
          });
        }
      }
      setTransactions((prev) => {
        // Safety check: If data was loaded from localStorage in the meantime (race condition),
        // or if we somehow already have data, don't append duplicates.
        if (prev.length > 5) return prev;

        // Ensure no ID collisions just in case
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueHistory = history.filter((h) => !existingIds.has(h.id));

        return [...prev, ...uniqueHistory];
      });
    }
  }, []); // Run once on mount (dependency array empty to avoid loop, though checking length inside)

  const addTransaction = (trx: Omit<Transaction, "id" | "date">) => {
    const newTrx: Transaction = {
      ...trx,
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTrx, ...prev]);
  };

  const addExpense = (exp: Omit<Expense, "id" | "date">) => {
    const newExp: Expense = {
      ...exp,
      id: `EXP-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const getTransactionsByBranch = (branchName: string) => {
    if (!branchName || branchName === "Semua Cabang") return transactions;
    return transactions.filter((t) => t.branchName === branchName);
  };

  const getExpensesByBranch = (branchName: string) => {
    if (!branchName || branchName === "Semua Cabang") return expenses;
    return expenses.filter((e) => e.branchName === branchName);
  };

  const getDailyRevenue = (date: Date, branchName?: string) => {
    const relevantTrx = branchName
      ? getTransactionsByBranch(branchName)
      : transactions;
    return relevantTrx
      .filter(
        (t) => isSameDay(parseISO(t.date), date) && t.status === "completed",
      )
      .reduce((acc, t) => acc + t.totalAmount, 0);
  };

  const getMonthlyRevenue = (date: Date, branchName?: string) => {
    const relevantTrx = branchName
      ? getTransactionsByBranch(branchName)
      : transactions;
    return relevantTrx
      .filter(
        (t) => isSameMonth(parseISO(t.date), date) && t.status === "completed",
      )
      .reduce((acc, t) => acc + t.totalAmount, 0);
  };

  const getTotalRevenue = (branchName?: string) => {
    const relevantTrx = branchName
      ? getTransactionsByBranch(branchName)
      : transactions;
    return relevantTrx
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + t.totalAmount, 0);
  };

  const getTopProducts = (limit = 5, branchName?: string) => {
    const relevantTrx = branchName
      ? getTransactionsByBranch(branchName)
      : transactions;
    const productMap = new Map<
      string,
      { name: string; sold: number; revenue: number }
    >();

    relevantTrx.forEach((t) => {
      if (t.status !== "completed") return;
      t.items.forEach((item) => {
        const existing = productMap.get(item.productName) || {
          name: item.productName,
          sold: 0,
          revenue: 0,
        };
        existing.sold += item.quantity;
        existing.revenue += item.subtotal;
        productMap.set(item.productName, existing);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, limit);
  };

  const getBranchPerformance = () => {
    const branchMap = new Map<string, number>();
    let total = 0;

    transactions.forEach((t) => {
      if (t.status !== "completed") return;
      const current = branchMap.get(t.branchName) || 0;
      branchMap.set(t.branchName, current + t.totalAmount);
      total += t.totalAmount;
    });

    return Array.from(branchMap.entries())
      .map(([branch, revenue]) => ({
        branch,
        revenue,
        percentage: total > 0 ? Math.round((revenue / total) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const getDailyStats = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayTrx = transactions.filter(
      (t) => isSameDay(parseISO(t.date), today) && t.status === "completed",
    );
    const yesterdayTrx = transactions.filter(
      (t) => isSameDay(parseISO(t.date), yesterday) && t.status === "completed",
    );

    const todayRevenue = todayTrx.reduce((acc, t) => acc + t.totalAmount, 0);
    const yesterdayRevenue = yesterdayTrx.reduce(
      (acc, t) => acc + t.totalAmount,
      0,
    );

    const todayProducts = todayTrx.reduce(
      (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );
    const yesterdayProducts = yesterdayTrx.reduce(
      (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    const activeBranches = new Set(transactions.map((t) => t.branchName)).size;

    return {
      revenue: todayRevenue,
      revenueGrowth:
        yesterdayRevenue > 0
          ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
          : 0,
      transactions: todayTrx.length,
      transactionGrowth:
        yesterdayTrx.length > 0
          ? ((todayTrx.length - yesterdayTrx.length) / yesterdayTrx.length) *
            100
          : 0,
      activeBranches,
      productsSold: todayProducts,
      productGrowth:
        yesterdayProducts > 0
          ? ((todayProducts - yesterdayProducts) / yesterdayProducts) * 100
          : 0,
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        expenses,
        addTransaction,
        addExpense,
        getTransactionsByBranch,
        getExpensesByBranch,
        getDailyRevenue,
        getMonthlyRevenue,
        getTotalRevenue,
        getTopProducts,
        getBranchPerformance,
        getDailyStats,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider",
    );
  }
  return context;
}
