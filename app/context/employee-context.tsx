"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  Employee,
  initialEmployees,
} from "../(frontend)/(pages)/(dashboard)/dashboard/karyawan/data/mock-data";

interface ActiveEmployee {
  id: string;
  name: string;
  role: string;
}

interface EmployeeContextType {
  employees: Employee[];
  activeEmployee: ActiveEmployee | null;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  verifyPin: (pin: string, branch: string) => Employee | null;
  setActiveEmployee: (employee: ActiveEmployee | null) => void;
  clearActiveEmployee: () => void;
  resetPin: (employeeId: string, newPin: string) => void;
  getEmployeesByBranch: (branch: string) => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined,
);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [activeEmployee, setActiveEmployeeState] =
    useState<ActiveEmployee | null>(null);

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
        addEmployee,
        updateEmployee,
        deleteEmployee,
        verifyPin,
        setActiveEmployee,
        clearActiveEmployee,
        resetPin,
        getEmployeesByBranch,
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
