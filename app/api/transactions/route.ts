import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Client with Service Role Key for admin privileges (bypass RLS)
// Fallback to Anon Key if Service Role not found (though Service Role is recommended for backend)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaction, items } = body;

    console.log("[API] Received transaction:", transaction);

    // 1. Insert Transaction Record
    const { data: trxData, error: trxError } = await supabase
      .from("transactions")
      .insert({
        branch_id: transaction.branchId,
        cashier_id: transaction.cashierId,
        cashier_name: transaction.cashierName,
        customer_name: transaction.customerName,
        total_amount: transaction.totalAmount,
        payment_method: transaction.paymentMethod,
        amount_paid: transaction.amountPaid,
        change_amount: transaction.changeAmount,
        status: transaction.status || "completed",
      })
      .select()
      .single();

    if (trxError) {
      console.error("[API] Transaction Insert Error:", trxError);
      return NextResponse.json(
        { error: "Failed to create transaction record", details: trxError },
        { status: 500 },
      );
    }

    // 2. Insert Transaction Items
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        transaction_id: trxData.id,
        product_id: item.productId,
        product_name: item.productName,
        variant_name: item.variant,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("[API] Items Insert Error:", itemsError);
        return NextResponse.json(
          { error: "Failed to create transaction items", details: itemsError },
          { status: 500 },
        );
      }

      // 3. Update Stock (Decrease)
      // We process updates in parallel for performance
      await Promise.all(items.map(async (item: any) => {
          // Only decrement if product exists and track_stock might be true. 
          // We can try to decrement where track_stock is true.
          // Since we don't know track_stock status here without fetching, 
          // we can rely on a SQL query that conditionally updates.
          // But Supabase simple client update:
          // update products set stock = stock - qty where id = item.productId and track_stock = true
          
          // However, supabase-js .update() doesn't support "stock = stock - qty" syntax directly without RPC.
          // We must fetch current stock OR use RPC.
          // Fallback: Fetch product first.
          
          const { data: product } = await supabase
            .from("products")
            .select("stock, track_stock")
            .eq("id", item.productId)
            .single();
            
          if (product && product.track_stock) {
             const newStock = (product.stock || 0) - item.quantity;
             await supabase
               .from("products")
               .update({ stock: newStock })
               .eq("id", item.productId);
          }
      }));
    }

    // 3. Return Success
    // We append items to the returned data structure to match what the Context expects
    const responseData = {
      ...trxData,
      items: items || [], // Return items back
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("[API] Unexpected Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 },
    );
  }
}
