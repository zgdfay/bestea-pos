import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { DashboardHeader } from "./dashboard/components/dashboard-header";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Dashboard - Bestea POS",
  description: "Dashboard Bestea POS - Kelola bisnis minuman Anda dengan mudah",
  keywords: ["POS", "Point of Sale", "Bestea", "Dashboard", "Minuman"],
  authors: [{ name: "Bestea Team" }],
  robots: "noindex, nofollow",
  openGraph: {
    title: "Dashboard - Bestea POS",
    description: "Kelola bisnis minuman Anda dengan mudah",
    type: "website",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["super_admin", "branch_admin"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-3 md:p-4 pt-3 bg-slate-50/50">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
