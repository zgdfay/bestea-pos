import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Client with Service Role Key for secure access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password/PIN harus diisi" },
        { status: 400 }
      );
    }

    console.log("[API Login] Attempting login for:", email);

    // 1. Check for Admin (super_admin role)
    const { data: adminData, error: adminError } = await supabase
      .from("employees")
      .select("*, branches(*)")
      .eq("email", email)
      .eq("role", "super_admin")
      .eq("status", "active")
      .maybeSingle();

    if (adminData && adminData.pin === password) {
       console.log("[API Login] Admin found:", adminData.name);
       return NextResponse.json({
        success: true,
        role: "super_admin",
        employee: adminData,
        // Branch handling will be done by client context based on returned data
        // API just returns the raw data + branches
        branches: adminData.branches
      });
    }

    // 2. Check for Cashier/Branch Admin (email + PIN)
    const { data: employeeData, error: empError } = await supabase
      .from("employees")
      .select("*, branches(*)")
      .eq("email", email)
      .eq("pin", password)
      .eq("status", "active")
      .maybeSingle();

    if (employeeData) {
      console.log("[API Login] Employee found:", employeeData.name);
      return NextResponse.json({
        success: true,
        role: employeeData.role,
        employee: employeeData,
        branches: employeeData.branches
      });
    }

    return NextResponse.json(
      { error: "Email atau PIN tidak ditemukan" },
      { status: 401 }
    );

  } catch (error) {
    console.error("[API Login] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
