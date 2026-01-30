import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Product, CartItem } from "../data/mock-data";
import { Trash2, Plus, Minus, CreditCard } from "lucide-react";
import Image from "next/image";

interface CartSectionProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, change: number, variantName?: string) => void;
  onRemoveItem: (id: string, variantName?: string) => void;
  onCheckout: () => void;
  orderNumber: string;
}

export function CartSection({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  orderNumber,
}: CartSectionProps) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );
  const total = subtotal; // No Tax

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-100 flex-none">
        <h2 className="font-bold text-xl text-slate-800">Pesanan Saat Ini</h2>
        <p className="text-sm text-muted-foreground">{orderNumber}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium">Keranjang Kosong</p>
            <p className="text-sm">
              Silakan pilih produk untuk memulai pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={`${item.id}-${item.variant.name}`}
              className="flex items-start gap-3 group"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <Image
                  src={item.image || "/images/placeholder-image.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                      {item.name}
                    </h4>
                    {item.variant.name !== "Standard" && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {item.variant.name}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-green-600 text-sm whitespace-nowrap ml-2">
                    {formatter.format(item.variant.price * item.quantity)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">
                    {formatter.format(item.variant.price)} / pcs
                  </span>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, -1, item.variant.name)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, 1, item.variant.name)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:border-green-200 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemoveItem(item.id, item.variant.name)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors self-center ml-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-none">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatter.format(subtotal)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>{formatter.format(total)}</span>
          </div>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold shadow-lg shadow-green-200"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Bayar Sekarang
        </Button>
      </div>
    </div>
  );
}
