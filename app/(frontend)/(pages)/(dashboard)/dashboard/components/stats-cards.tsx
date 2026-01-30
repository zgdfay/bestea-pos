"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingBag,
  Activity,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold">{value}</div>
        <p
          className={`text-xs flex items-center mt-1 ${isPositive ? "text-green-600" : "text-red-500"}`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          )}
          {isPositive ? "+" : ""}
          {change}% dari kemarin
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Omset Hari Ini"
        value={formatter.format(3580000)}
        change={20.1}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Transaksi"
        value="142"
        change={12}
        icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Rata-rata Order"
        value={formatter.format(25211)}
        change={-2.1}
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Produk Terjual"
        value="382"
        change={8}
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
