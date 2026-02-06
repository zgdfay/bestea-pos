"use client";

import * as React from "react";

// Tipe untuk konteks cabang
export type BranchType = "admin" | "cabang";
export type RoleType = "super_admin" | "branch_admin" | "cashier" | "guest";

export interface Branch {
  id: string;
  name: string;
  type: BranchType;
  email?: string;
  password?: string;
  address?: string;
  phone?: string;
}

interface BranchContextType {
  currentBranch: Branch;
  branches: Branch[];
  setCurrentBranch: (branch: Branch) => void;
  addBranch: (branch: Omit<Branch, "id">) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;
  getBranchById: (id: string) => Branch | undefined;
  // Auth
  isAdmin: boolean;
  userRole: RoleType;
  setUserRole: (role: RoleType) => void;
  login: (
    email: string,
    pass: string,
  ) => Promise<{
    success: boolean;
    role?: RoleType;
    branch?: Branch;
    error?: string;
    employee?: { id: string; name: string; role: string; branch: string };
  }>;
  logout: () => void;
  isSuperAdmin: boolean;
  isBranchAdmin: boolean;
  isCashier: boolean;
}

// Data cabang default
const defaultBranches: Branch[] = [
  {
    id: "admin",
    name: "Bestea POS",
    type: "admin",
    email: "admin@bestea.com",
    password: "admin",
  },
  {
    id: "bangil",
    name: "Cabang Bangil",
    type: "cabang",
    address: "Jl. Raya Bangil No. 123",
    phone: "0343-123456",
  },
  {
    id: "pasuruan",
    name: "Cabang Pasuruan",
    type: "cabang",
    address: "Jl. Raya Pasuruan No. 456",
    phone: "0343-654321",
  },
];

import {
  Employee,
  initialEmployees,
} from "../app/(frontend)/(pages)/(dashboard)/dashboard/karyawan/data/mock-data";

const STORAGE_KEY = "bestea-branches";
const AUTH_KEY = "bestea-auth-session";

const BranchContext = React.createContext<BranchContextType | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = React.useState<Branch[]>(defaultBranches);
  const [currentBranch, setCurrentBranch] = React.useState<Branch>(
    defaultBranches[0],
  );
  const [userRole, setUserRole] = React.useState<RoleType>("guest");
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    // Load branches
    const savedBranches = localStorage.getItem(STORAGE_KEY);
    if (savedBranches) {
      try {
        const parsed = JSON.parse(savedBranches);
        setBranches(parsed);
      } catch (e) {
        console.error("Failed to parse branches", e);
      }
    }

    // Load auth session
    const savedSession = localStorage.getItem(AUTH_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setUserRole(session.role);
        if (session.branchId) {
          // Find branch from loaded branches or default branches if not yet loaded
          // Note: inside useEffect, 'branches' might be initial state, relying on parsed above if available?
          // Actually state updates are async, so we should look at 'parsed' if available or 'branches'
          // Ideally we check against the source of truth we just loaded
          const sourceBranches = savedBranches
            ? JSON.parse(savedBranches)
            : defaultBranches;
          const branch = sourceBranches.find(
            (b: Branch) => b.id === session.branchId,
          );
          if (branch) {
            setCurrentBranch(branch);
          }
        }
      } catch (e) {
        console.error("Failed to parse auth session", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save branches to localStorage when they change
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    }
  }, [branches, isLoaded]);

  // Save auth session
  React.useEffect(() => {
    if (isLoaded) {
      const session = {
        role: userRole,
        branchId: currentBranch.id,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));

      // Also sync with the legacy key for kasir compatibility if cashier type
      if (currentBranch.type === "cabang") {
        localStorage.setItem(
          "bestea-kasir-branch",
          JSON.stringify(currentBranch),
        );
      }
    }
  }, [userRole, currentBranch, isLoaded]);

  const addBranch = React.useCallback((branchData: Omit<Branch, "id">) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
    };
    setBranches((prev) => [...prev, newBranch]);
  }, []);

  const updateBranch = React.useCallback((updatedBranch: Branch) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === updatedBranch.id ? updatedBranch : b)),
    );
  }, []);

  const deleteBranch = React.useCallback((id: string) => {
    // Don't allow deleting admin branch
    if (id === "admin") return;
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getBranchById = React.useCallback(
    (id: string) => {
      return branches.find((b) => b.id === id);
    },
    [branches],
  );

  const login = React.useCallback(
    async (email: string, pass: string) => {
      // 1. Check for Admin
      // For now we check the special 'admin' branch or if any branch has admin type
      const adminBranch = branches.find(
        (b) => b.type === "admin" && b.email === email && b.password === pass,
      );
      if (adminBranch) {
        setUserRole("super_admin");
        setCurrentBranch(adminBranch);
        return {
          success: true,
          role: "super_admin" as RoleType,
          branch: adminBranch,
        };
      }

      // 2. Check for Employee (Email & PIN)
      // Check localStorage first
      let allEmployees = initialEmployees;
      // Access storage safely on client
      if (typeof window !== "undefined") {
        const savedEmployees = localStorage.getItem("bestea-employees");
        if (savedEmployees) {
          try {
            allEmployees = JSON.parse(savedEmployees);
          } catch (e) {
            console.error("Failed to parse local employees", e);
          }
        }
      }

      const employee = allEmployees.find(
        (e) => e.email === email && e.pin === pass && e.status === "active",
      );

      if (employee) {
        // Find branch of this employee
        const branchName = employee.branch;
        const branch = branches.find((b) => b.name === branchName);

        if (branch) {
          setUserRole("cashier");
          setCurrentBranch(branch); // Set device branch context automatically

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "bestea-active-employee",
              JSON.stringify({
                id: employee.id,
                name: employee.name,
                role: employee.role,
              }),
            );
          }

          return {
            success: true,
            role: "cashier" as RoleType,
            branch: branch,
            employee: employee, // Return employee details used by Login Page
          };
        } else {
          return { success: false, error: "Cabang karyawan tidak ditemukan" };
        }
      }

      // 3. Check for Branch Account (Legacy/Fallback)
      const branch = branches.find(
        (b) => b.type === "cabang" && b.email === email && b.password === pass,
      );
      if (branch) {
        setUserRole("cashier");
        setCurrentBranch(branch);
        return { success: true, role: "cashier" as RoleType, branch: branch };
      }

      return { success: false, error: "Email atau PIN tidak ditemukan" };
    },
    [branches],
  );

  const logout = React.useCallback(() => {
    setUserRole("guest");
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("bestea-kasir-branch");
  }, []);

  const value = React.useMemo(
    () => ({
      currentBranch,
      branches,
      setCurrentBranch,
      addBranch,
      updateBranch,
      deleteBranch,
      getBranchById,
      isAdmin: currentBranch.type === "admin",
      userRole,
      setUserRole,
      login,
      logout,
      isSuperAdmin: userRole === "super_admin",
      isBranchAdmin: userRole === "branch_admin",
      isCashier: userRole === "cashier",
    }),
    [
      currentBranch,
      branches,
      userRole,
      addBranch,
      updateBranch,
      deleteBranch,
      getBranchById,
      login,
      logout,
    ],
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useBranch() {
  const context = React.useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
