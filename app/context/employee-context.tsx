"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  Employee,
  initialEmployees,
} from "../(frontend)/(pages)/(dashboard)/dashboard/karyawan/data/mock-data";

interface ActiveEmployee {
  id: string;
  name: string;
  role: string;
  branch: string; // Added branch to active employee
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branch: string;
  date: string; // ISO Date
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  status: "Hadir" | "Sakit" | "Izin" | "Alpha";
  shift: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  month: string; // MM-YYYY
  hoursWorked: number;
  baseSalary: number;
  hourlyRate: number;
  totalSalary: number;
  status: "Pending" | "Paid";
}

interface EmployeeContextType {
  employees: Employee[];
  activeEmployee: ActiveEmployee | null;
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];

  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;

  verifyPin: (pin: string, branch: string) => Employee | null;
  setActiveEmployee: (employee: ActiveEmployee | null) => void;
  clearActiveEmployee: () => void;
  resetPin: (employeeId: string, newPin: string) => void;
  getEmployeesByBranch: (branch: string) => Employee[];

  // Attendance & Payroll
  clockIn: (employeeId: string, shift: string) => void;
  clockOut: (employeeId: string) => void;
  addAttendanceManual: (record: AttendanceRecord) => void;
  markPayrollPaid: (payrollId: string) => void;
  addPayroll: (record: PayrollRecord) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined,
);

// Mock Initial Data
const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "ATT-001",
    employeeId: "EMP-001",
    employeeName: "Budi Santoso",
    branch: "Cabang Bangil",
    date: new Date().toISOString(),
    checkIn: "08:00",
    checkOut: "16:00",
    status: "Hadir",
    shift: "Pagi",
  },
];

const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "PAY-001",
    employeeId: "EMP-001",
    employeeName: "Budi Santoso",
    role: "Kasir",
    month: "01-2024", // January 2024
    hoursWorked: 160,
    baseSalary: 2500000,
    hourlyRate: 15000,
    totalSalary: 2500000 + 160 * 15000, // Simplify calc
    status: "Paid",
  },
];

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [activeEmployee, setActiveEmployeeState] =
    useState<ActiveEmployee | null>(null);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [payrollRecords, setPayrollRecords] =
    useState<PayrollRecord[]>(INITIAL_PAYROLL);

  // Persistence
  useEffect(() => {
    const savedAtt = localStorage.getItem("bestea-attendance");
    if (savedAtt) setAttendanceRecords(JSON.parse(savedAtt));
    const savedPay = localStorage.getItem("bestea-payroll");
    if (savedPay) setPayrollRecords(JSON.parse(savedPay));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "bestea-attendance",
      JSON.stringify(attendanceRecords),
    );
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("bestea-payroll", JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  }, []);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e)),
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Verify PIN and return employee if valid
  const verifyPin = useCallback(
    (pin: string, branch: string): Employee | null => {
      const employee = employees.find(
        (e) => e.pin === pin && e.branch === branch && e.status === "active",
      );
      return employee || null;
    },
    [employees],
  );

  const setActiveEmployee = useCallback((employee: ActiveEmployee | null) => {
    setActiveEmployeeState(employee);
    // Persist to localStorage for session recovery
    if (employee) {
      localStorage.setItem("bestea-active-employee", JSON.stringify(employee));
    } else {
      localStorage.removeItem("bestea-active-employee");
    }
  }, []);

  const clearActiveEmployee = useCallback(() => {
    setActiveEmployeeState(null);
    localStorage.removeItem("bestea-active-employee");
  }, []);

  const resetPin = useCallback((employeeId: string, newPin: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, pin: newPin } : e)),
    );
  }, []);

  const getEmployeesByBranch = useCallback(
    (branch: string): Employee[] => {
      return employees.filter(
        (e) => e.branch === branch && e.status === "active",
      );
    },
    [employees],
  );

  // Attendance Logic
  const clockIn = (employeeId: string, shift: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      branch: emp.branch,
      date: new Date().toISOString(),
      checkIn: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      checkOut: "-",
      status: "Hadir",
      shift,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  const clockOut = (employeeId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => {
        if (
          record.employeeId === employeeId &&
          record.checkOut === "-" &&
          new Date(record.date).getDate() === new Date().getDate()
        ) {
          return {
            ...record,
            checkOut: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return record;
      }),
    );
  };

  const addAttendanceManual = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
  };

  const addPayroll = (record: PayrollRecord) => {
    setPayrollRecords((prev) => [...prev, record]);
  };

  const markPayrollPaid = (payrollId: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === payrollId ? { ...p, status: "Paid" } : p)),
    );
  };

  // Load active employee from localStorage on mount
  React.useEffect(() => {
    const savedActive = localStorage.getItem("bestea-active-employee");
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        setActiveEmployeeState(parsed);
      } catch (e) {
        console.error("Failed to parse active employee", e);
      }
    }

    const savedEmployees = localStorage.getItem("bestea-employees");
    if (savedEmployees) {
      try {
        const parsed = JSON.parse(savedEmployees);
        setEmployees(parsed);
      } catch (e) {
        console.error("Failed to parse employees", e);
      }
    }
  }, []);

  // Save employees whenever they change
  React.useEffect(() => {
    localStorage.setItem("bestea-employees", JSON.stringify(employees));
  }, [employees]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        activeEmployee,
        attendanceRecords,
        payrollRecords,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        verifyPin,
        setActiveEmployee,
        clearActiveEmployee,
        resetPin,
        getEmployeesByBranch,
        clockIn,
        clockOut,
        addAttendanceManual,
        markPayrollPaid,
        addPayroll,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
