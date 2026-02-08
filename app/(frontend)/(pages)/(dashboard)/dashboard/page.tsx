"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";

import { StatsCards } from "./components/stats-cards";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { RecentSales } from "./components/recent-sales";
import { TopProducts } from "./components/top-products";
import { CategoryBreakdown } from "./components/category-breakdown";
import { Loader2 } from "lucide-react";

interface DashboardData {
  revenue: number;
  revenueGrowth: number;
  transactionCount: number;
  transactionGrowth: number;
  activeBranches: number;
  productsSold: number;
  productGrowth: number;
  recentSales: any[];
  topProducts: any[];
  branchPerformance: any[];
}

export default function DashboardPage() {
  const { userRole, isCashier, currentBranch } = useBranch();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect kasir ke halaman POS
  useEffect(() => {
    if (isCashier) {
      router.push("/kasir");
    }
  }, [isCashier, router]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (isCashier) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({ period: "today" });
        if (currentBranch?.id) query.append("branchId", currentBranch.id);

        const res = await fetch(`/api/dashboard/stats?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch stats");

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentBranch, isCashier]);

  // Jangan render dashboard content untuk kasir saat redirecting
  if (isCashier) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-4">
      {/* Top Stats Cards */}
      <StatsCards stats={data} />

      {/* Chart and Recent Transactions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ChartAreaInteractive />
        </div>
        <RecentSales sales={data.recentSales} />
      </div>

      {/* Top Products and Category Breakdown */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <TopProducts products={data.topProducts} />
        </div>
        <CategoryBreakdown branchPerformance={data.branchPerformance} />
      </div>
    </div>
  );
}
