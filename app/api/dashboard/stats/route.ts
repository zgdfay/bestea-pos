import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const period = searchParams.get("period") || "today";

    const now = new Date();
    let start: Date, end: Date;

    // 1. Calculate Date Range
    switch (period) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "yesterday":
        const yesterday = subDays(now, 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case "this_week":
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "this_month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "this_year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case "7d":
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        break;
      case "14d":
        start = startOfDay(subDays(now, 14));
        end = endOfDay(now);
        break;
      case "30d":
        start = startOfDay(subDays(now, 30));
        end = endOfDay(now);
        break;
      default:
        start = startOfDay(now);
        end = endOfDay(now);
    }

    // 2. Fetch Transactions for the period
    let query = supabase
      .from("transactions")
      .select("*, branches(name)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .eq("status", "completed");

    if (branchId && branchId !== "all") {
      query = query.eq("branch_id", branchId);
    }

    const { data: transactions, error: trxError } = await query;
    if (trxError) throw trxError;

    // 3. Fetch Expenses for the period
    let expenseQuery = supabase
      .from("expenses")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (branchId && branchId !== "all") {
      expenseQuery = expenseQuery.eq("branch_id", branchId);
    }

    const { data: expenses, error: expError } = await expenseQuery;
    if (expError) throw expError;

    // 4. Calculate Previous Period (for Growth)
    let prevStart: Date, prevEnd: Date;
    if (period === "today") {
         prevStart = startOfDay(subDays(now, 1));
         prevEnd = endOfDay(subDays(now, 1));
    } else if (period === "yesterday") {
         prevStart = startOfDay(subDays(now, 2));
         prevEnd = endOfDay(subDays(now, 2));
    } else {
         // Fallback: previous period of same duration
         const duration = end.getTime() - start.getTime();
         prevEnd = new Date(start.getTime() - 1);
         prevStart = new Date(prevEnd.getTime() - duration);
    }

    let prevQuery = supabase
      .from("transactions")
      .select("total_amount, id, branch_id")
      .gte("created_at", prevStart.toISOString())
      .lte("created_at", prevEnd.toISOString())
      .eq("status", "completed");

    if (branchId && branchId !== "all") {
      prevQuery = prevQuery.eq("branch_id", branchId);
    }
    const { data: prevTransactions } = await prevQuery;


    // 5. Aggregation Logic
    const totalRevenue = transactions?.reduce((acc, t) => acc + t.total_amount, 0) || 0;
    const totalTransactions = transactions?.length || 0;
    const totalExpenses = expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;
    const netProfit = totalRevenue - totalExpenses;

    const prevRevenue = prevTransactions?.reduce((acc, t) => acc + t.total_amount, 0) || 0;
    const prevTransactionsCount = prevTransactions?.length || 0;
    
    // Products Sold & Top Products
    const currentTrxIds = transactions?.map(t => t.id) || [];
    let productsSold = 0;
    let topProducts: { name: string; sold: number; revenue: number }[] = [];

    if (currentTrxIds.length > 0) {
         const { data: items } = await supabase
            .from("transaction_items")
            .select("product_name, quantity, subtotal, product_id")
            .in("transaction_id", currentTrxIds);
         
         if (items) {
             productsSold = items.reduce((acc, i) => acc + i.quantity, 0);
             
             // Top Products Logic
             const productStats: Record<string, {name: string, sold: number, revenue: number}> = {};
             items.forEach(item => {
                 const pid = item.product_id || item.product_name; 
                 if (!productStats[pid]) {
                     productStats[pid] = { name: item.product_name, sold: 0, revenue: 0 };
                 }
                 productStats[pid].sold += item.quantity;
                 productStats[pid].revenue += item.subtotal;
             });
             topProducts = Object.values(productStats)
                 .sort((a, b) => b.sold - a.sold)
                 .slice(0, 5);
         }
    }

    const prevTrxIds = prevTransactions?.map(t => t.id) || [];
    let prevProductsSold = 0;
    if (prevTrxIds.length > 0) {
         const { data: prevItems } = await supabase
            .from("transaction_items")
            .select("quantity")
            .in("transaction_id", prevTrxIds);
         prevProductsSold = prevItems?.reduce((acc, i) => acc + i.quantity, 0) || 0;
    }

    const calcGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calcGrowth(totalRevenue, prevRevenue);
    const transactionGrowth = calcGrowth(totalTransactions, prevTransactionsCount);
    const productGrowth = calcGrowth(productsSold, prevProductsSold);
    
    const activeBranches = new Set(transactions?.map(t => t.branch_id)).size;

    // 6. Recent Sales
    const recentSales = [...(transactions || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(t => ({
            id: t.id,
            totalAmount: t.total_amount,
            paymentMethod: t.payment_method,
            items: [], 
        }));

    if (recentSales.length > 0) {
        const recentIds = recentSales.map(r => r.id);
         const { data: recentItems } = await supabase
            .from("transaction_items")
            .select("transaction_id, product_name")
            .in("transaction_id", recentIds);
        
        recentSales.forEach(sale => {
             // @ts-ignore
            sale.items = recentItems?.filter(i => i.transaction_id === sale.id).map(i => ({ productName: i.product_name })) || [];
        });
    }

    // 7. Chart Data (Daily Breakdown)
    const chartMap = new Map<string, { date: string; tunai: number; qris: number }>();
    
    // Initialize with all dates in range
    // We iterate from start to end
    let currentDate = new Date(start);
    while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        chartMap.set(dateKey, { date: dateKey, tunai: 0, qris: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    transactions?.forEach(t => {
        const dateKey = t.created_at.split('T')[0]; // YYYY-MM-DD
        if (chartMap.has(dateKey)) {
             const entry = chartMap.get(dateKey)!;
             if (t.payment_method === 'cash') {
                 entry.tunai += t.total_amount;
             } else {
                 entry.qris += t.total_amount;
             }
        }
    });
    const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // 8. Branch Performance
    const branchMap = new Map<string, number>();
    transactions?.forEach(t => {
        // @ts-ignore
        const bName = t.branches?.name || "Unknown";
        const current = branchMap.get(bName) || 0;
        branchMap.set(bName, current + t.total_amount);
    });
    
    const branchPerformance = Array.from(branchMap.entries())
        .map(([branch, revenue]) => ({
            branch,
            revenue,
            percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      revenue: totalRevenue,
      revenueGrowth,
      transactionCount: totalTransactions,
      transactionGrowth,
      expenses: totalExpenses,
      profit: netProfit,
      activeBranches,
      productsSold,
      productGrowth,
      topProducts,
      recentSales,
      branchPerformance,
      chartData,
      period,
      branchId
    });

  } catch (error) {
    console.error("[API Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
