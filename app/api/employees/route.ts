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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        branches (name)
      `)
      .order("name");

    if (error) throw error;

    const formatted = data.map((e: any) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone || "",
      role:
        e.role === "cashier"
          ? "Kasir"
          : e.role === "branch_admin"
            ? "Admin Cabang"
            : "Super Admin",
      branch: e.branches?.name || "",
      branchId: e.branch_id,
      status: e.status,
      joinDate: e.join_date,
      baseSalary: Number(e.base_salary),
      hourlyRate: Number(e.hourly_rate),
      pin: e.pin || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[API Employees] Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, branch, status, baseSalary, hourlyRate, pin } = body;

    // Map role to DB enum
    const roleMap: Record<string, string> = {
        "Kasir": "cashier",
        "Admin Cabang": "branch_admin",
        "Super Admin": "super_admin"
    };

    // Get Branch ID if branch name is provided (or if branchId is not provided)
    // The frontend might send branch name or ID. Let's assume it sends branch name for now based on current UI, 
    // but best practice is to send ID. 
    // Looking at the Karyawan Page, it has access to branches list.
    // I'll assume the frontend will be refactored to send `branchId` directly if available, 
    // but if it sends name, I might need to lookup. 
    // Actually, in the frontend refactor, I will make sure to send `branchId`.
    // But for safety let's handle the `branch` (name) lookup if `branchId` is missing, 
    // OR just expect `branchId` from the frontend refactor.
    
    // Let's rely on the frontend sending the correct `branch_id`.
    // Wait, the current frontend sends `branch` name. I should update frontend to use `branchId`.
    
    let branchId = body.branchId;
    if (!branchId && branch) {
       const { data: bData } = await supabase.from("branches").select("id").eq("name", branch).single();
       if(bData) branchId = bData.id;
    }

    const { data, error } = await supabase
      .from("employees")
      .insert([{
        name,
        email,
        phone,
        role: roleMap[role] || "cashier",
        branch_id: branchId,
        status,
        join_date: new Date().toISOString().split('T')[0], // Today
        base_salary: baseSalary,
        hourly_rate: hourlyRate,
        pin
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);

  } catch (error) {
    console.error("[API Employees] Create Error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, email, phone, role, branch, status, baseSalary, hourlyRate, pin } = body;

        const roleMap: Record<string, string> = {
            "Kasir": "cashier",
            "Admin Cabang": "branch_admin",
            "Super Admin": "super_admin"
        };
        
        let branchId = body.branchId;
        if (!branchId && branch) {
           const { data: bData } = await supabase.from("branches").select("id").eq("name", branch).single();
           if(bData) branchId = bData.id;
        }

        const { error } = await supabase
            .from("employees")
            .update({
                name,
                email,
                phone,
                role: roleMap[role] || "cashier",
                branch_id: branchId,
                status,
                base_salary: baseSalary,
                hourly_rate: hourlyRate,
                pin
            })
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API Employees] Update Error:", error);
        return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        
        if(!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const { error } = await supabase.from("employees").delete().eq("id", id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("[API Employees] Delete Error:", error);
         return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
    }
}
