"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";

import { StatsCards } from "./components/stats-cards";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { RecentSales } from "./components/recent-sales";
import { TopProducts } from "./components/top-products";
import { CategoryBreakdown } from "./components/category-breakdown";

export default function DashboardPage() {
  const { userRole, isCashier } = useBranch();
  const router = useRouter();

  // Redirect kasir ke halaman POS
  useEffect(() => {
    if (isCashier) {
      router.push("/kasir");
    }
  }, [isCashier, router]);

  // Jangan render dashboard content untuk kasir saat redirecting
  if (isCashier) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-4">
      {/* Top Stats Cards */}
      <StatsCards />

      {/* Chart and Recent Transactions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ChartAreaInteractive />
        </div>
        <RecentSales />
      </div>

      {/* Top Products and Category Breakdown */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
        <TopProducts />
        <CategoryBreakdown />
      </div>
    </div>
  );
}
