import { AuthGuard } from "@/components/auth-guard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kasir - Bestea POS",
  description: "Point of Sale Kasir Bestea - Proses transaksi dengan cepat",
  keywords: ["POS", "Kasir", "Bestea", "Transaksi", "Minuman"],
  authors: [{ name: "Bestea Team" }],
  robots: "noindex, nofollow",
  openGraph: {
    title: "Kasir - Bestea POS",
    description: "Proses transaksi dengan cepat dan mudah",
    type: "website",
  },
};

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["cashier"]}>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </AuthGuard>
  );
}
