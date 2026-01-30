"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Breadcrumb mapping
const breadcrumbMap: Record<string, { parent?: string; label: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/dashboard/produk": { parent: "Dashboard", label: "Produk" },
  "/dashboard/produk/kategori": { parent: "Produk", label: "Kategori" },
  "/dashboard/produk/variasi": { parent: "Produk", label: "Variasi" },
  "/dashboard/pesanan": { parent: "Dashboard", label: "Pesanan" },
  "/dashboard/pesanan/riwayat": { parent: "Pesanan", label: "Riwayat" },
  "/dashboard/karyawan": { parent: "Dashboard", label: "Karyawan" },
  "/dashboard/karyawan/shift": { parent: "Karyawan", label: "Shift" },
  "/dashboard/karyawan/role": { parent: "Karyawan", label: "Role" },
  "/dashboard/karyawan/absensi": { parent: "Karyawan", label: "Absensi" },
  "/dashboard/karyawan/payroll": { parent: "Karyawan", label: "Payroll" },
  "/dashboard/request-stok": { parent: "Dashboard", label: "Request Stok" },
  "/dashboard/request-stok/riwayat": {
    parent: "Request Stok",
    label: "Riwayat",
  },
  "/dashboard/cabang": { parent: "Dashboard", label: "Cabang" },
  "/dashboard/cabang/tambah": { parent: "Cabang", label: "Tambah" },
  "/dashboard/laporan": { parent: "Dashboard", label: "Laporan" },
  "/dashboard/laporan/penjualan": { parent: "Laporan", label: "Penjualan" },
  "/dashboard/laporan/stok": { parent: "Laporan", label: "Stok" },
  "/dashboard/laporan/keuangan": { parent: "Laporan", label: "Keuangan" },
  "/dashboard/pengaturan": { parent: "Dashboard", label: "Pengaturan" },
  "/dashboard/pengaturan/printer": { parent: "Pengaturan", label: "Printer" },
  "/dashboard/pengaturan/akun": { parent: "Pengaturan", label: "Akun" },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const currentPage = breadcrumbMap[pathname] || { label: "Dashboard" };

  return (
    <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2 px-3 md:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {currentPage.parent && (
              <>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-slate-500 hover:text-slate-900"
                  >
                    {currentPage.parent}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-900">
                {currentPage.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
