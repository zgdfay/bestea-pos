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
const chartData = [
  { date: "2026-01-01", tunai: 2500, qris: 1800 },
  { date: "2026-01-02", tunai: 3200, qris: 2100 },
  { date: "2026-01-03", tunai: 2800, qris: 1900 },
  { date: "2026-01-04", tunai: 4100, qris: 2800 },
  { date: "2026-01-05", tunai: 3800, qris: 3200 },
  { date: "2026-01-06", tunai: 4500, qris: 3500 },
  { date: "2026-01-07", tunai: 5200, qris: 4100 },
  { date: "2026-01-08", tunai: 3100, qris: 2400 },
  { date: "2026-01-09", tunai: 2900, qris: 2200 },
  { date: "2026-01-10", tunai: 3500, qris: 2600 },
  { date: "2026-01-11", tunai: 4200, qris: 3100 },
  { date: "2026-01-12", tunai: 3900, qris: 2900 },
  { date: "2026-01-13", tunai: 4800, qris: 3600 },
  { date: "2026-01-14", tunai: 5100, qris: 4200 },
  { date: "2026-01-15", tunai: 3400, qris: 2500 },
  { date: "2026-01-16", tunai: 3100, qris: 2300 },
  { date: "2026-01-17", tunai: 4600, qris: 3400 },
  { date: "2026-01-18", tunai: 5300, qris: 4100 },
  { date: "2026-01-19", tunai: 4900, qris: 3800 },
  { date: "2026-01-20", tunai: 3200, qris: 2400 },
  { date: "2026-01-21", tunai: 2800, qris: 2100 },
  { date: "2026-01-22", tunai: 3600, qris: 2700 },
  { date: "2026-01-23", tunai: 4100, qris: 3200 },
  { date: "2026-01-24", tunai: 4700, qris: 3600 },
  { date: "2026-01-25", tunai: 5500, qris: 4300 },
  { date: "2026-01-26", tunai: 5800, qris: 4600 },
  { date: "2026-01-27", tunai: 4200, qris: 3300 },
  { date: "2026-01-28", tunai: 3580, qris: 2800 },
];

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

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2026-01-28");
    let daysToSubtract = 30;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "14d") {
      daysToSubtract = 14;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

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
