import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Product,
  ProductVariant,
} from "../../../(dashboard)/dashboard/produk/data/mock-data-products";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Image from "next/image";

interface SizeSelectionModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, variant: ProductVariant) => void;
}

export function SizeSelectionModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: SizeSelectionModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  useEffect(() => {
    if (isOpen && product && product.variants) {
      // Default to Medium
      const defaultVariant = product.variants.find((v) => v.name === "Medium");
      setSelectedVariant(defaultVariant || product.variants[0]);
    }
  }, [isOpen, product]);

  if (!product || !product.variants) return null;

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Ukuran</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          <div className="h-24 w-24 bg-slate-50 relative rounded-md overflow-hidden shrink-0">
            <Image
              src={product.image || "/images/placeholder-image.svg"}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-slate-500 text-sm">Silakan pilih ukuran cup.</p>
          </div>
        </div>

        <div className="py-2">
          <RadioGroup
            value={selectedVariant?.name}
            onValueChange={(val) => {
              const variant = product?.variants?.find((v) => v.name === val);
              if (variant) setSelectedVariant(variant);
            }}
            className="grid gap-4"
          >
            {product.variants.map((variant) => (
              <div key={variant.name}>
                <RadioGroupItem
                  value={variant.name}
                  id={variant.name}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={variant.name}
                  className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                >
                  <span className="font-semibold text-base">
                    {variant.name}
                  </span>
                  <span className="font-bold text-green-700">
                    {formatter.format(variant.price)}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={() => {
              if (selectedVariant) {
                onConfirm(product, selectedVariant);
                onClose();
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!selectedVariant}
          >
            Tambah Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
