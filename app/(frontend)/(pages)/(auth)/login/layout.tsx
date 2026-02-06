import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Bestea POS",
  description: "Bestea POS",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      {children}
    </div>
  );
}
