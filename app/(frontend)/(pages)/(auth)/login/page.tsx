"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBranch } from "@/contexts/branch-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, User, KeyRound } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useBranch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success("Berhasil masuk!", {
          description: `Selamat datang kembali, ${result.role === "cashier" ? result.employee?.name : "Admin"}`,
        });

        if (result.role === "super_admin" || result.role === "branch_admin") {
          router.push("/dashboard");
        } else if (result.role === "cashier") {
          router.push("/kasir");
        } else {
          router.push("/dashboard"); // Default fallback
        }
      } else {
        toast.error("Gagal masuk", {
          description:
            result.error || "Silakan cek kembali email dan password/PIN Anda.",
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Side - Visuals */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white overflow-hidden relative">
        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Image
                src="/logo/bestea-logo.png"
                alt="Logo Bestea POS"
                width={40}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Bestea POS</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Sistem Kasir Modern untuk Bisnis Teh Kekinian.
          </h2>
          <p className="text-orange-50 text-lg max-w-md">
            Kelola penjualan, inventori, dan karyawan dalam satu platform yang
            terintegrasi dan mudah digunakan.
          </p>
        </div>

        <div className="relative z-10 text-sm text-orange-100/60">
          © 2025 Bestea Indonesia. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-2 text-center">
            {/* Mobile Logo */}
            <div className="lg:hidden mx-auto mb-4 bg-orange-50 p-3 rounded-full">
              <Image
                src="/logo/bestea-logo.png"
                alt="Logo Bestea POS"
                width={60}
                height={60}
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang
            </h1>
            <p className="text-muted-foreground text-sm">
              Masuk untuk mengelola outlet Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold text-slate-700">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@bestea.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="font-semibold text-slate-700"
                >
                  Password / PIN
                </Label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••"
                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gunakan PIN 4 digit untuk akses Kasir.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-md hover:shadow-lg mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Butuh bantuan akses?{" "}
            <a href="#" className="underline hover:text-orange-600">
              Hubungi Administrator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
