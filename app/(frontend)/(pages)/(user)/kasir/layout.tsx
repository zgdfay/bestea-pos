"use client";

import { AuthGuard } from "@/components/auth-guard";

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
