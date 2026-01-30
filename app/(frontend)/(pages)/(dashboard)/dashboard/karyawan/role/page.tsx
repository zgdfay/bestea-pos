"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { roles as initialRoles, permissions } from "../data/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function RolePage() {
  const [roles, setRoles] = useState(initialRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    perms: [] as string[],
  });

  const handleOpenModal = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        perms: role.perms,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        perms: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Nama role harus diisi");
      return;
    }

    if (editingRole) {
      setRoles(
        roles.map((r) => (r.id === editingRole.id ? { ...r, ...formData } : r)),
      );
      toast.success("Role berhasil diperbarui");
    } else {
      const newRole = {
        id: `role_${Date.now()}`,
        ...formData,
        users: 0,
        color: "bg-slate-100 text-slate-700 border-slate-200",
      };
      setRoles([...roles, newRole]);
      toast.success("Role baru berhasil ditambahkan");
    }
    setIsModalOpen(false);
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => {
      const perms = prev.perms.includes(permId)
        ? prev.perms.filter((p) => p !== permId)
        : [...prev.perms, permId];
      return { ...prev, perms };
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Role & Akses
          </h1>
          <p className="text-muted-foreground">
            Atur tingkat otorisasi pengguna dalam sistem
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleOpenModal()}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Tambah Role Baru
        </Button>
      </div>

      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Info Sistem</AlertTitle>
        <AlertDescription>
          Perubahan pada hak akses role akan berlaku efektif saat pengguna login
          kembali.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Role</CardTitle>
            <CardDescription>
              Ringkasan role yang tersedia dan jumlah pengguna aktif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Role</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-center">Pengguna Aktif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant="outline" className={role.color}>
                        {role.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {role.users} User
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(role)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matriks Hak Akses (Permission Matrix)</CardTitle>
            <CardDescription>
              Detail kewenangan untuk setiap role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      Hak Akses (Permission)
                    </TableHead>
                    <TableHead>Kategori</TableHead>
                    {roles.map((role) => (
                      <TableHead
                        key={role.id}
                        className="text-center w-[150px]"
                      >
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-medium">
                        {perm.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {perm.category}
                        </Badge>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.id} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={role.perms.includes(perm.id)}
                              disabled // Read only for matrix view
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Tambah Role Baru"}
            </DialogTitle>
            <DialogDescription>
              Konfigurasi detail role dan hak akses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Role</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Staff Gudang"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Deskripsi</Label>
              <Input
                id="desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi singkat tugas role ini"
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Hak Akses (Permissions)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-start space-x-2 border p-3 rounded-md"
                  >
                    <Checkbox
                      id={`perm-${perm.id}`}
                      checked={formData.perms.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`perm-${perm.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {perm.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Kategori: {perm.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
