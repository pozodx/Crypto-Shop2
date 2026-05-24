import { useState } from "react";
import { useListAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListAdminProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Tag, CheckCircle2, XCircle } from "lucide-react";
import { Product, ProductInput } from "@workspace/api-client-react";

export default function ProductsAdmin() {
  const { data: products, isLoading } = useListAdminProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    priceUsd: 0,
    category: "",
    imageUrl: "",
    isActive: true,
    stock: null,
    digitalContent: "",
    deliveryNote: ""
  });

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      priceUsd: 0,
      category: "",
      imageUrl: "",
      isActive: true,
      stock: null,
      digitalContent: "",
      deliveryNote: ""
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      priceUsd: product.priceUsd,
      category: product.category,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      stock: product.stock,
      digitalContent: "", // Normally wouldn't load this in a list response depending on API, but good for structural purpose
      deliveryNote: product.deliveryNote || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
            toast({ title: "Product updated successfully" });
            setIsDialogOpen(false);
          }
        }
      );
    } else {
      createProduct.mutate(
        { data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
            toast({ title: "Product created successfully" });
            setIsDialogOpen(false);
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
            toast({ title: "Product deleted" });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <Button onClick={openNewDialog} data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : products?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No products found. Add one to get started.</TableCell>
                  </TableRow>
                ) : (
                  products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden border border-border">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Tag className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>${product.priceUsd.toFixed(2)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <div className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <XCircle className="w-4 h-4" /> Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} data-testid={`button-edit-${product.id}`}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(product.id)} data-testid={`button-delete-${product.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required data-testid="input-product-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={formData.priceUsd} onChange={e => setFormData({...formData, priceUsd: parseFloat(e.target.value)})} required data-testid="input-product-price" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required data-testid="input-product-category" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" value={formData.imageUrl || ""} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." data-testid="input-product-image" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="h-24" data-testid="input-product-description" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="digitalContent">Digital Content to Deliver (Keys, links, text)</Label>
                <Textarea id="digitalContent" value={formData.digitalContent || ""} onChange={e => setFormData({...formData, digitalContent: e.target.value})} placeholder="e.g. LICENSE-KEY-12345" className="h-24 font-mono" data-testid="input-product-content" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNote">Delivery Note (Optional instructions)</Label>
                <Input id="deliveryNote" value={formData.deliveryNote || ""} onChange={e => setFormData({...formData, deliveryNote: e.target.value})} data-testid="input-product-note" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="active" checked={formData.isActive} onCheckedChange={checked => setFormData({...formData, isActive: checked})} data-testid="switch-product-active" />
                <Label htmlFor="active">Active (visible in store)</Label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} data-testid="button-save-product">
                  {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
