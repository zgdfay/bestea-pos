import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const employeeId = searchParams.get("employeeId");
    const checkStatus = searchParams.get("checkStatus"); // If true, return today's status for employee

    // Mode: Check Status for specific employee today
    if (checkStatus === "true" && employeeId) {
       const today = new Date().toISOString().split("T")[0];
       const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .maybeSingle();

       if (error) throw error;
       return NextResponse.json(data || null);
    }

    // Mode: Fetch All/Filtered Records
    let query = supabase
      .from("attendance_records")
      .select(`
        *,
        employees (
          name,
          role,
          branch_id
        ),
        branches (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (branchId && branchId !== "all") {
      query = query.eq("branch_id", branchId);
    }

    if (date) {
      query = query.eq("date", date);
    }

    if (employeeId) {
        query = query.eq("employee_id", employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match frontend expectations if needed
    const formattedData = data.map((record: any) => ({
        id: record.id,
        employeeId: record.employee_id,
        employeeName: record.employees?.name || "Unknown",
        role: record.employees?.role || "-",
        branchId: record.branch_id,
        branch: record.branches?.name || "Unknown",
        date: record.date,
        checkIn: record.check_in,
        checkOut: record.check_out,
        status: record.status,
        shift: record.shift,
        notes: record.notes,
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, branchId, shift, status, notes, checkInTime, date } = body;

    // Validation
    if (!employeeId || !branchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const recordDate = date || today;

    // Check if already clocked in today
    const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("date", recordDate)
        .single();
    
    if (existing) {
        return NextResponse.json(
            { error: "Employee already has an attendance record for this date" },
             { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .insert([
        {
          employee_id: employeeId,
          branch_id: branchId,
          date: recordDate,
          check_in: checkInTime || new Date(recordDate).toISOString(), // Default to 00:00 UTC of target date (07:00 WIB)
          status: status || "Hadir",
          shift: shift || "Pagi", // Default to Pagi for now
          notes: notes || "",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create attendance" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
     const body = await request.json();
     const { id, employeeId, action, notes, checkOutTime } = body; // action: 'clock_out' or 'update'

     if (!id && !employeeId) {
        return NextResponse.json({ error: "Missing ID or EmployeeID" }, { status: 400 });
     }

     if (action === "clock_out") {
         // Clock Out Logic
         const today = new Date().toISOString().split("T")[0];
         const { status: bodyStatus } = body;
         
         // Find record if ID not provided
         let recordId = id;
         if (!recordId) {
             const { data: todayRecord } = await supabase
                .from("attendance_records")
                .select("id")
                .eq("employee_id", employeeId)
                .eq("date", today)
                .single();
            
            if (!todayRecord) {
                return NextResponse.json({ error: "No attendance record found for today" }, { status: 404 });
            }
            recordId = todayRecord.id;
         }

         const updateData: any = {
             check_out: checkOutTime || new Date().toISOString(),
             notes: notes 
         };

         if (bodyStatus) {
             updateData.status = bodyStatus;
         }

         const { data, error } = await supabase
            .from("attendance_records")
            .update(updateData)
            .eq("id", recordId)
            .select()
            .single();
        
         if (error) throw error;
         return NextResponse.json(data);

     } else {
         // Generic Update (Admin Edit)
         const { data, error } = await supabase
            .from("attendance_records")
            .update(body) // Be careful with what's in body
            .eq("id", id)
            .select()
            .single();

         if (error) throw error;
         return NextResponse.json(data);
     }

  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update attendance" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete attendance" },
      { status: 500 }
    );
  }
}
