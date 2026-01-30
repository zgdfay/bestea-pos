"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePrinter } from "../context/printer-context";
import { Printer, Ruler, Save } from "lucide-react";
import { toast } from "sonner";

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrinterSettingsModal({
  isOpen,
  onOpenChange,
}: PrinterSettingsModalProps) {
  const { settings, updateSettings, isConnected, printReceipt } = usePrinter();

  // Local state for pending changes
  const [width, setWidth] = useState<"58mm" | "80mm">(settings.paperWidth);
  const [chunkSize, setChunkSize] = useState<number>(settings.chunkSize || 100);

  const handleSave = () => {
    updateSettings({
      paperWidth: width,
      chunkSize: chunkSize,
    });
    toast.success("Pengaturan printer disimpan");
    onOpenChange(false);
  };

  const handleTestPrint = async () => {
    // Create a dummy transaction for testing
    const now = new Date();
    const testTransaction = {
      id: "TEST-001",
      date: now.toLocaleDateString("id-ID"),
      time: now.toLocaleTimeString("id-ID"),
      total: 15000,
      paymentMethod: "cash" as const,
      status: "completed" as const,
      items: [
        {
          productId: "test-1",
          name: "Test Product",
          price: 15000,
          quantity: 1,
          variant: "Regular",
        },
      ],
    };

    updateSettings({ paperWidth: width, chunkSize: chunkSize });
    await printReceipt(testTransaction);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Pengaturan Printer
          </DialogTitle>
          <DialogDescription>
            Sesuaikan konfigurasi printer thermal anda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Ukuran Kertas</Label>
            </div>

            <RadioGroup
              value={width}
              onValueChange={(val) => setWidth(val as "58mm" | "80mm")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="58mm"
                  id="58mm"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="58mm"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-2 text-xl font-bold">58mm</span>
                  <span className="text-xs text-muted-foreground">
                    Standard Receipt
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="80mm"
                  id="80mm"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="80mm"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-2 text-xl font-bold">80mm</span>
                  <span className="text-xs text-muted-foreground">
                    Wide Receipt
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Chunk Size Setting */}
          <div className="space-y-2">
            <Label htmlFor="chunkSize" className="text-base">
              Chunk Size (bytes)
            </Label>
            <input
              id="chunkSize"
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              min={20}
              max={512}
            />
            <p className="text-xs text-muted-foreground">
              Nilai lebih kecil = lebih stabil. Default: 100
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestPrint}
            disabled={!isConnected}
            className="w-full sm:w-auto"
          >
            Test Print
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none"
            >
              Simpan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
