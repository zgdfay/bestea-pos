"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/auth-guard";

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register Service Worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <AuthGuard allowedRoles={["cashier"]}>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </AuthGuard>
  );
}
