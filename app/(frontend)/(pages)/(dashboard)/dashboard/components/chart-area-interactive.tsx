"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "Grafik Penjualan Interaktif";

// Mock sales data for the last 3 months (in thousands IDR)
// Static data removed

const chartConfig = {
  penjualan: {
    label: "Penjualan",
  },
  tunai: {
    label: "Tunai",
    color: "#22c55e", // Green
  },
  qris: {
    label: "QRIS",
    color: "#3b82f6", // Blue
  },
} satisfies ChartConfig;

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

import { useTransactions } from "@/app/context/transaction-context";
import { parseISO, format, subDays, startOfDay, isAfter } from "date-fns";
import { id } from "date-fns/locale";

// ... constants ...

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const { transactions } = useTransactions();

  const filteredData = React.useMemo(() => {
    // Prepare date map
    const daysToSubtract =
      timeRange === "30d" ? 30 : timeRange === "14d" ? 14 : 7;
    const startDate = subDays(startOfDay(new Date()), daysToSubtract);

    const dataMap = new Map<
      string,
      { date: string; tunai: number; qris: number }
    >();

    // Initialize all days in range with 0
    for (let i = 0; i <= daysToSubtract; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = format(d, "yyyy-MM-dd");
      dataMap.set(dateKey, { date: dateKey, tunai: 0, qris: 0 });
    }

    transactions.forEach((t) => {
      const tDate = parseISO(t.date);
      if (isAfter(tDate, startDate)) {
        const dateKey = format(tDate, "yyyy-MM-dd");
        const entry = dataMap.get(dateKey);
        if (entry && t.status === "completed") {
          if (t.paymentMethod === "cash") entry.tunai += t.totalAmount;
          else entry.qris += t.totalAmount;
        }
      }
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [transactions, timeRange]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Grafik Penjualan</CardTitle>
          <CardDescription>
            Performa penjualan berdasarkan metode pembayaran
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Pilih rentang waktu"
          >
            <SelectValue placeholder="30 hari terakhir" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              30 hari terakhir
            </SelectItem>
            <SelectItem value="14d" className="rounded-lg">
              14 hari terakhir
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 hari terakhir
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTunai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tunai)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tunai)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillQris" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-qris)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-qris)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    });
                  }}
                  formatter={(value, name) => (
                    <div className="flex justify-between w-full gap-4">
                      <span className="text-muted-foreground capitalize">
                        {name}
                      </span>
                      <span className="font-bold">
                        {formatter.format(Number(value) * 1000)}
                      </span>
                    </div>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="qris"
              type="natural"
              fill="url(#fillQris)"
              stroke="var(--color-qris)"
              stackId="a"
            />
            <Area
              dataKey="tunai"
              type="natural"
              fill="url(#fillTunai)"
              stroke="var(--color-tunai)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
