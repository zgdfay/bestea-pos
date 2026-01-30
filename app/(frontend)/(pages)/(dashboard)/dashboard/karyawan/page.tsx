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
  Plus,
  Search,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Key,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useEmployee } from "@/app/context/employee-context";
import { useBranch } from "@/contexts/branch-context";
import { Employee, statusConfig, roles } from "./data/mock-data";

export default function KaryawanPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, resetPin } =
    useEmployee();
  const { branches } = useBranch();
  const cabangList = branches.filter((b) => b.type === "cabang");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    branch: string;
    status: "active" | "inactive";
    baseSalary: number;
    hourlyRate: number;
    pin: string;
  }>({
    name: "",
    email: "",
    phone: "",
    role: "Kasir",
    branch: cabangList[0]?.name || "",
    status: "active",
    baseSalary: 1500000,
    hourlyRate: 15000,
    pin: "", // PIN untuk kasir
  });

  // Generate random 4-digit PIN
  const generatePin = () => {
    return String(Math.floor(1000 + Math.random() * 9000));
  };

  const handleOpenModal = (emp: any = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        branch: emp.branch,
        status: emp.status,
        baseSalary: emp.baseSalary || 1500000,
        hourlyRate: emp.hourlyRate || 15000,
        pin: emp.pin || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Kasir",
        branch: cabangList[0]?.name || "",
        status: "active",
        baseSalary: 1500000,
        hourlyRate: 15000,
        pin: generatePin(), // Auto-generate PIN for new employee
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error("Harap isi nama dan email");
      return;
    }

    if (editingEmployee) {
      const updatedEmp: Employee = {
        ...editingEmployee,
        ...formData,
      };
      updateEmployee(updatedEmp);
      toast.success("Data karyawan diperbarui");
    } else {
      const newEmp: Employee = {
        id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
        ...formData,
        joinDate: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      addEmployee(newEmp);
      toast.success("Karyawan baru ditambahkan");
    }
    setIsModalOpen(false);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId);
      toast.success("Karyawan dan Akun berhasil dihapus");
      setDeleteId(null);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBranch = branchFilter === "all" || emp.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Karyawan</h1>
          <p className="text-muted-foreground">
            Kelola data seluruh karyawan dan penempatan cabang
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari karyawan berdasarkan nama atau filter per cabang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Cabang" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Semua Cabang</SelectItem>
                {cabangList.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Karyawan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>PIN Kasir</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Gabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                          {emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="mr-1.5 h-3 w-3" />
                        {emp.email}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="mr-1.5 h-3 w-3" />
                        {emp.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {emp.pin ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 font-mono"
                        >
                          <Key className="h-3 w-3 mr-1" />
                          {emp.pin}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      {emp.branch}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusConfig[emp.status as keyof typeof statusConfig]
                          .className
                      }
                    >
                      {
                        statusConfig[emp.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.joinDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenModal(emp)}>
                          Edit Data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newPin = generatePin();
                            resetPin(emp.id, newPin);
                            toast.success(
                              `PIN baru untuk ${emp.name}: ${newPin}`,
                            );
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset PIN
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => confirmDelete(emp.id)}
                        >
                          Hapus Karyawan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi data profil dan penempatan kerja karyawan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">No. WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0812..."
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pin">PIN Kasir (4 digit)</Label>
              <div className="flex gap-2">
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pin: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  placeholder="1234"
                  className="font-mono text-center tracking-widest"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({ ...formData, pin: generatePin() })
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                PIN digunakan untuk absen masuk/keluar di kasir
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role / Jabatan</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch">Penempatan Cabang</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(v) => setFormData({ ...formData, branch: v })}
                >
                  <SelectTrigger id="branch" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {cabangList.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="baseSalary">Gaji Pokok</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    id="baseSalary"
                    type="number"
                    className="pl-9"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseSalary: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hourlyRate">Rate Per Jam</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    id="hourlyRate"
                    type="number"
                    className="pl-9"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyRate: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status Karyawan</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    status: v as "active" | "inactive",
                  })
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="active">Aktif Bekerja</SelectItem>
                  <SelectItem value="inactive">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {editingEmployee ? "Simpan Perubahan" : "Simpan Karyawan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apakah Anda yakin?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus karyawan juga akan{" "}
              <span className="font-bold text-red-600">
                MENGHAPUS AKUN LOGIN
              </span>{" "}
              mereka secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Ya, Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
