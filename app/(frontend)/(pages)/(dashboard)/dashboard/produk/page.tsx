"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  MoreHorizontal,
  Search,
  Package,
  Filter,
  ImageIcon,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { initialCategories, type Product } from "./data/mock-data-products";
import { useProducts } from "@/app/context/product-context";

export default function ProductPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    price: 0,
    trackStock: true,
    stock: 0,
    status: "active",
    image: "",
    variants: [],
  });

  const filteredProducts = products.filter((prod) => {
    const matchSearch = prod.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || prod.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleOpenModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        category: prod.category,
        price: prod.price,
        trackStock: prod.trackStock !== undefined ? prod.trackStock : true,
        stock: prod.stock,
        status: prod.status,
        image: prod.image,
        variants: prod.variants || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: initialCategories[0]?.name || "",
        price: 0,
        trackStock: true,
        stock: 0,
        status: "active",
        image: "",
        variants: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.category) {
      toast.error("Nama dan Kategori wajib diisi");
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData,
        // Ensure image is preserved if not changed (though formData.image should handle it)
        image: formData.image || editingProduct.image,
      });
      toast.success("Produk berhasil diperbarui");
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        ...formData,
        image: formData.image || "/placeholder.jpg",
      };
      addProduct(newProd);
      toast.success("Produk baru berhasil ditambahkan");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast.success("Produk berhasil dihapus");
      setDeleteId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // function toggleVariant removed

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Produk</h1>
          <p className="text-muted-foreground">
            Kelola menu, harga, dan stok produk Anda
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {initialCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Tidak ada produk yang ditemukan
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((prod) => (
                  <Card
                    key={prod.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                      {prod.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-slate-300" />
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {prod.status === "active" ? (
                          <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Arsip</Badge>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {prod.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-slate-50 mt-1 text-xs"
                        >
                          {prod.category}
                        </Badge>
                      </div>

                      {/* Variants */}
                      {prod.variants && prod.variants.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            Varian:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {prod.variants.map((v, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {v.name}: {formatCurrency(v.price)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(prod.price)}
                        </div>
                      )}

                      {/* Stock */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stok:</span>
                        <span
                          className={`font-semibold ${
                            !prod.trackStock
                              ? "text-blue-600"
                              : prod.stock < 10
                                ? "text-red-600"
                                : "text-slate-700"
                          }`}
                        >
                          {prod.trackStock ? prod.stock : "Unlimited"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenModal(prod)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(prod.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1}-
                    {Math.min(endIndex, filteredProducts.length)} dari{" "}
                    {filteredProducts.length} produk
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* Simple logic for now: show current page */}
                      <PaginationItem>
                        <PaginationLink isActive>{currentPage}</PaginationLink>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>Isi detail produk dan harga.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {initialCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status Produk</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="active">Aktif (Dijual)</SelectItem>
                    <SelectItem value="inactive">
                      Arsip (Disembunyikan)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="flex flex-col gap-2">
              <Label>Gambar Produk</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 relative rounded-md overflow-hidden bg-slate-100 border border-input shrink-0 flex items-center justify-center">
                  {formData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="grid gap-1.5 flex-1">
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer file:cursor-pointer"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Format: JPG, PNG, WEBP. Maks 2MB.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Es Teh Manis"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Harga Dasar (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stock">Stok Awal</Label>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor="trackStock"
                      className="text-xs text-muted-foreground font-normal cursor-pointer"
                    >
                      Lacak Stok
                    </Label>
                    <Switch
                      id="trackStock"
                      className="scale-75 origin-right"
                      checked={formData.trackStock}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, trackStock: checked })
                      }
                    />
                  </div>
                </div>
                {formData.trackStock ? (
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value),
                      })
                    }
                  />
                ) : (
                  <Input
                    disabled
                    value="Unlimited"
                    className="bg-slate-100 text-slate-500 font-medium"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Varian Ukuran (Opsional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newVariant = { name: "", price: formData.price };
                  setFormData({
                    ...formData,
                    variants: [...(formData.variants || []), newVariant],
                  });
                }}
              >
                <Plus className="mr-2 h-3 w-3" />
                Tambah Varian
              </Button>
            </div>

            {formData.variants && formData.variants.length > 0 ? (
              <div className="space-y-3">
                {formData.variants.map((variant, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="grid gap-1 flex-1">
                      <Label className="text-xs">Nama (ex: Large)</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...(formData.variants || [])];
                          newVariants[idx].name = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                      />
                    </div>
                    <div className="grid gap-1 w-[120px]">
                      <Label className="text-xs">Harga</Label>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...(formData.variants || [])];
                          newVariants[idx].price =
                            parseInt(e.target.value) || 0;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        const newVariants = formData.variants?.filter(
                          (_, i) => i !== idx,
                        );
                        setFormData({
                          ...formData,
                          variants: newVariants || [],
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada varian (Harga mengikuti Harga Dasar)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan Produk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk?</DialogTitle>
            <DialogDescription>
              Tindakan ini permanen. Produk akan dihapus dari semua cabang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
