"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Transaction } from "../data/mock-data";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  time: string;
  employeeId?: string;
  employeeName?: string;
}

export interface ShiftEmployee {
  id: string;
  name: string;
  role: string;
}

interface ShiftData {
  startTime: string | null;
  endTime: string | null;
  initialCash: number;
  totalCashTransactions: number;
  totalQrisTransactions: number;
  totalExpenses: number;
  expenses: Expense[];
  transactions: Transaction[];
  expectedCash: number;
  actualCash: number | null;
  discrepancy: number | null;
  notes: string | null;
  branchName: string;
  // Employee tracking
  openedBy: ShiftEmployee | null;
  closedBy: ShiftEmployee | null;
}

interface ShiftContextType {
  isShiftOpen: boolean;
  shiftData: ShiftData;
  openShift: (initialCash: number, employee: ShiftEmployee) => void;
  closeShift: (
    actualCash: number,
    employee: ShiftEmployee,
    notes?: string,
  ) => void;
  addTransaction: (transaction: Transaction) => void;
  addExpense: (
    amount: number,
    description: string,
    employee?: ShiftEmployee,
  ) => void;
  isLoading: boolean;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: null,
    endTime: null,
    initialCash: 0,
    totalCashTransactions: 0,
    totalQrisTransactions: 0,
    totalExpenses: 0,
    expenses: [],
    transactions: [],
    expectedCash: 0,
    actualCash: null,
    discrepancy: null,
    notes: null,
    branchName: "",
    openedBy: null,
    closedBy: null,
  });

  // Load shift state and selected branch from local storage on mount
  useEffect(() => {
    // Load selected branch
    const savedBranch = localStorage.getItem("bestea-kasir-branch");
    let branchName = "Cabang Bangil"; // fallback
    if (savedBranch) {
      try {
        const parsed = JSON.parse(savedBranch);
        branchName = parsed.name || branchName;
      } catch (e) {
        console.error("Failed to parse saved branch", e);
      }
    }

    // Load shift state
    const savedShift = localStorage.getItem("bestea-pos-shift");
    if (savedShift) {
      const parsed = JSON.parse(savedShift);
      if (parsed.isShiftOpen) {
        setIsShiftOpen(true);
        setShiftData(parsed.shiftData);
      } else {
        // Set branch name for new shift
        setShiftData((prev) => ({ ...prev, branchName }));
      }
    } else {
      // Set branch name for new shift
      setShiftData((prev) => ({ ...prev, branchName }));
    }
    setIsLoading(false);
  }, []);

  // Save shift state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "bestea-pos-shift",
      JSON.stringify({ isShiftOpen, shiftData }),
    );
  }, [isShiftOpen, shiftData]);

  const openShift = (initialCash: number, employee: ShiftEmployee) => {
    const now = new Date().toISOString();
    setShiftData({
      startTime: now,
      endTime: null,
      initialCash,
      totalCashTransactions: 0,
      totalQrisTransactions: 0,
      totalExpenses: 0,
      expenses: [],
      transactions: [],
      expectedCash: initialCash,
      actualCash: null,
      discrepancy: null,
      notes: null,
      branchName: shiftData.branchName,
      openedBy: employee,
      closedBy: null,
    });
    setIsShiftOpen(true);
  };

  const closeShift = (
    actualCash: number,
    employee: ShiftEmployee,
    notes?: string,
  ) => {
    const now = new Date().toISOString();
    const discrepancy = actualCash - shiftData.expectedCash;

    setShiftData((prev) => ({
      ...prev,
      endTime: now,
      actualCash,
      discrepancy,
      notes: notes || null,
      closedBy: employee,
    }));
    setIsShiftOpen(false);
  };

  const addTransaction = (transaction: Transaction) => {
    if (!isShiftOpen) return;

    setShiftData((prev) => {
      const newTotalCash =
        transaction.paymentMethod === "cash"
          ? prev.totalCashTransactions + transaction.total
          : prev.totalCashTransactions;

      const newTotalQris =
        transaction.paymentMethod === "qris"
          ? prev.totalQrisTransactions + transaction.total
          : prev.totalQrisTransactions;

      return {
        ...prev,
        totalCashTransactions: newTotalCash,
        totalQrisTransactions: newTotalQris,
        transactions: [transaction, ...prev.transactions],
        expectedCash: prev.initialCash + newTotalCash - prev.totalExpenses,
      };
    });
  };

  const addExpense = (
    amount: number,
    description: string,
    employee?: ShiftEmployee,
  ) => {
    if (!isShiftOpen) return;

    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      amount,
      description,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      employeeId: employee?.id,
      employeeName: employee?.name,
    };

    setShiftData((prev) => {
      const newTotalExpenses = prev.totalExpenses + amount;
      return {
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        totalExpenses: newTotalExpenses,
        expectedCash:
          prev.initialCash + prev.totalCashTransactions - newTotalExpenses,
      };
    });
  };

  return (
    <ShiftContext.Provider
      value={{
        isShiftOpen,
        shiftData,
        openShift,
        closeShift,
        addTransaction,
        addExpense,
        isLoading,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}
