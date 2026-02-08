
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/payroll
 * ... (existing code)
 */
export async function GET(request: NextRequest) {
  // ... (existing GET logic)
  try {
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get("month"); // "01-2024"
    const branchId = searchParams.get("branch_id");

    if (!monthParam) {
      return NextResponse.json(
        { error: "Month parameter is required (MM-YYYY)" },
        { status: 400 }
      );
    }

    // Convert MM-YYYY to YYYY-MM for DB and date filtering
    const [mm, yyyy] = monthParam.split("-");
    const dbMonth = `${yyyy}-${mm}`; // "2024-01"

    // Calculate start and end date of the month for attendance query
    const startDate = `${yyyy}-${mm}-01`;
    // Get last day of month
    const lastDay = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
    const endDate = `${yyyy}-${mm}-${lastDay}`;

    // 1. Fetch Employees (Role: cashier only)
    let empQuery = supabase.from("employees").select("*").eq("role", "cashier");
    if (branchId) {
      empQuery = empQuery.eq("branch_id", branchId);
    }
    const { data: employees, error: empError } = await empQuery;

    if (empError) throw empError;

    // 2. Fetch Existing Payroll Records
    const { data: existingPayrolls, error: payrollError } = await supabase
      .from("payroll_records")
      .select("*")
      .eq("month", dbMonth);

    if (payrollError) throw payrollError;

    // 3. Fetch Attendance Records for the month
    // We need attendance to calculate hours for employees without payroll record
    const { data: attendance, error: attError } = await supabase
      .from("attendance_records")
      .select("employee_id, check_in, check_out, status")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("status", "Hadir")
      .not("check_out", "is", null);

    if (attError) throw attError;

    // 4. Merge Data
    const payrollData = employees.map((emp) => {
      // Check if record exists
      const record = existingPayrolls?.find((p) => p.employee_id === emp.id);

      if (record) {
        return {
          id: record.id,
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          month: monthParam, // Return in requested format
          hoursWorked: Number(record.hours_worked),
          baseSalary: Number(record.base_salary),
          hourlyRate: Number(record.hourly_rate),
          totalSalary: Number(record.total_salary),
          status: record.status,
          paidAt: record.paid_at, // Add paidAt
          isDraft: false,
        };
      }

      // Calculate from Attendance (Draft)
      const empAttendance = attendance?.filter((a) => a.employee_id === emp.id) || [];
      
      let totalHours = 0;
      empAttendance.forEach((att) => {
        if (att.check_in && att.check_out) {
          const start = new Date(att.check_in).getTime();
          const end = new Date(att.check_out).getTime();
          const durationMs = end - start;
          const durationHours = durationMs / (1000 * 60 * 60);
          totalHours += durationHours;
        }
      });

      // Round to 2 decimal places
      totalHours = Math.round(totalHours * 100) / 100;

      const baseSalary = Number(emp.base_salary) || 0;
      const hourlyRate = Number(emp.hourly_rate) || 0;
      const totalHourly = totalHours * hourlyRate;
      const totalSalary = baseSalary + totalHourly;

      return {
        id: `draft-${emp.id}`, // Temporary ID
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        month: monthParam,
        hoursWorked: totalHours,
        baseSalary: baseSalary,
        hourlyRate: hourlyRate,
        totalSalary: Math.round(totalSalary), // Round total salary
        status: "Draft",
        paidAt: null,
        isDraft: true,
      };
    });

    return NextResponse.json(payrollData);

  } catch (error: any) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payroll
 * ... (existing POST logic)
 */
export async function POST(request: NextRequest) {
   // ... (existing POST content - I will copy it to ensure I don't break it)
   try {
    const body = await request.json();
    const { 
      employeeId, 
      month, // "MM-YYYY"
      hoursWorked, 
      baseSalary,
      hourlyRate,
      totalSalary, 
      status 
    } = body;

    // Convert "MM-YYYY" to "YYYY-MM"
    const [mm, yyyy] = month.split("-");
    const dbMonth = `${yyyy}-${mm}`;

    // Check if record exists
    const { data: existing } = await supabase
      .from("payroll_records")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("month", dbMonth)
      .single();

    let result;
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from("payroll_records")
        .update({
          hours_worked: hoursWorked,
          base_salary: baseSalary,
          hourly_rate: hourlyRate,
          total_salary: totalSalary,
          status: status, // "Paid" or "Pending"
          updated_at: new Date().toISOString(),
          ...(status === 'Paid' ? { paid_at: new Date().toISOString() } : {})
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from("payroll_records")
        .insert({
          employee_id: employeeId,
          month: dbMonth,
          hours_worked: hoursWorked,
          base_salary: baseSalary,
          hourly_rate: hourlyRate,
          total_salary: totalSalary,
          status: status,
          ...(status === 'Paid' ? { paid_at: new Date().toISOString() } : {})
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error saving payroll:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payroll
 * Query Params: id (optional), employee_id, month
 * Deletes a payroll record (reset to draft).
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const employeeId = searchParams.get("employee_id");
    const month = searchParams.get("month");

    let query = supabase.from("payroll_records").delete();

    if (id && !id.startsWith("draft-")) {
      query = query.eq("id", id);
    } else if (employeeId && month) {
      const [mm, yyyy] = month.split("-");
      const dbMonth = `${yyyy}-${mm}`;
      query = query.eq("employee_id", employeeId).eq("month", dbMonth);
    } else {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payroll:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
