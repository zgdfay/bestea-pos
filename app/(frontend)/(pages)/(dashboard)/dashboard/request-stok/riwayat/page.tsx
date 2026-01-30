"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Search } from "lucide-react";
import { useBranch } from "@/contexts/branch-context";

// Mock data riwayat request
const mockRequests = [
  {
    id: "REQ-001",
    date: "2026-01-28",
    status: "approved",
    items: [
      { name: "Teh Tarik Original", quantity: 100, unit: "cup" },
      { name: "Thai Tea", quantity: 50, unit: "cup" },
    ],
    total: 150,
  },
  {
    id: "REQ-002",
    date: "2026-01-27",
    status: "pending",
    items: [
      { name: "Matcha Latte", quantity: 75, unit: "cup" },
      { name: "Brown Sugar Milk Tea", quantity: 80, unit: "cup" },
    ],
    total: 155,
  },
  {
    id: "REQ-003",
    date: "2026-01-26",
    status: "rejected",
    items: [{ name: "Teh Tarik Gula Aren", quantity: 200, unit: "cup" }],
    total: 200,
    reason: "Stok pusat tidak mencukupi",
  },
  {
    id: "REQ-004",
    date: "2026-01-25",
    status: "approved",
    items: [
      { name: "Thai Tea", quantity: 100, unit: "cup" },
      { name: "Teh Tarik Original", quantity: 120, unit: "cup" },
    ],
    total: 220,
  },
  {
    id: "REQ-005",
    date: "2026-01-24",
    status: "delivered",
    items: [
      { name: "Matcha Latte", quantity: 50, unit: "cup" },
      { name: "Brown Sugar Milk Tea", quantity: 60, unit: "cup" },
      { name: "Thai Tea", quantity: 40, unit: "cup" },
    ],
    total: 150,
  },
];

type RequestStatus = "pending" | "approved" | "rejected" | "delivered";

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  pending: {
    label: "Menunggu",
    variant: "secondary",
    className:
      "w-20 justify-center bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "Disetujui",
    variant: "outline",
    className:
      "w-20 justify-center bg-green-100 text-green-700 border-green-200",
  },
  rejected: {
    label: "Ditolak",
    variant: "outline",
    className: "w-20 justify-center bg-red-100 text-red-700 border-red-200",
  },
  delivered: {
    label: "Terkirim",
    variant: "outline",
    className: "w-20 justify-center bg-blue-100 text-blue-700 border-blue-200",
  },
};

export default function RiwayatRequestPage() {
  const { currentBranch, isAdmin } = useBranch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect jika admin
  if (isAdmin) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-yellow-600">
              Akses Terbatas
            </CardTitle>
            <CardDescription className="text-center">
              Halaman ini hanya tersedia untuk cabang.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch = request.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Request</h1>
        <p className="text-muted-foreground">
          Riwayat request stok dari {currentBranch.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor request..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="delivered">Terkirim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Request</CardTitle>
          <CardDescription>
            {filteredRequests.length} request ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Request</TableHead>
                <TableHead className="text-center">Tanggal</TableHead>
                <TableHead className="text-center">Total Item</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Tidak ada request yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell className="text-center">
                      {new Date(request.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.total} item
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          statusConfig[request.status as RequestStatus].variant
                        }
                        className={
                          statusConfig[request.status as RequestStatus]
                            .className
                        }
                      >
                        {statusConfig[request.status as RequestStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Detail Request {request.id}
                            </DialogTitle>
                            <DialogDescription>
                              Tanggal:{" "}
                              {new Date(request.date).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Status:
                              </span>
                              <Badge
                                variant={
                                  statusConfig[request.status as RequestStatus]
                                    .variant
                                }
                                className={
                                  statusConfig[request.status as RequestStatus]
                                    .className
                                }
                              >
                                {
                                  statusConfig[request.status as RequestStatus]
                                    .label
                                }
                              </Badge>
                            </div>

                            {request.reason && (
                              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                <strong>Alasan ditolak:</strong>{" "}
                                {request.reason}
                              </div>
                            )}

                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produk</TableHead>
                                  <TableHead className="text-right">
                                    Jumlah
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {request.items.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">
                                      {item.quantity} {item.unit}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
