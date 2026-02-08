import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    // Securely check for employee with this PIN
    // Note: In production, PINs should be hashed. For this MVP/Migration, we assume text match but server-side.
    const { data: employee, error } = await supabase
      .from("employees")
      .select(`
        *,
        branches (name)
      `)
      .eq("pin", pin)
      .eq("status", "active") // Only active employees
      .single();

    if (error || !employee) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    // Return employee data WITHOUT the PIN
    const formatted = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role:
        employee.role === "cashier"
          ? "Kasir"
          : employee.role === "branch_admin"
            ? "Admin Cabang"
            : "Super Admin",
      branch: employee.branches?.name || "",
      branchId: employee.branch_id,
      // Do NOT include pin here
    };

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("[Verify PIN] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
