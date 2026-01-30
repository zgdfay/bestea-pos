import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Bestea POS",
  description: "Bestea POS ",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/login-bg.png"
          alt="Login Background"
          fill
          className="h-full w-full object-cover dark:brightness-[0.5]"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/20">
          <div className="text-center p-10 backdrop-blur-sm rounded-xl bg-black/10">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-md">
              Bestea POS
            </h2>
            <p className="text-xl drop-shadow-sm font-light">
              Modern Point of Sales System
            </p>
          </div>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center py-12 lg:min-h-0 lg:py-0">
        {children}
      </div>
    </div>
  );
}
