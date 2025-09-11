import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, AlertTriangle, DollarSign, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { ProductForm } from '@/components/inventory/ProductForm';

import { useProducts, type Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { products, loading, deleteProduct } = useProducts();
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (((product as any)?.category?.name) && ((product as any).category.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (product.laboratory && product.laboratory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockProducts = products.filter(p => p.min_stock > 0 && p.min_stock >= 1);
  const outOfStockProducts = products.filter(p => !p.active);
  const totalValue = products.reduce((sum, p) => sum + (p.sale_price * 1), 0); // Simplificado para demo

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error eliminando producto",
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const getStockStatus = (active: boolean, requiresPrescription: boolean) => {
    if (!active) return { label: 'Inactivo', variant: 'destructive' as const };
    if (requiresPrescription) return { label: 'Requiere Receta', variant: 'secondary' as const };
    return { label: 'Activo', variant: 'default' as const };
  };

  const getPriceDisplay = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos de la farmacia</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedProduct(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct || undefined}
              onSave={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{getPriceDisplay(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Lista de Productos ({filteredProducts.length})
            </CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU/Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Precio Compra</TableHead>
                    <TableHead>Stock Min/Max</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.active, product.requires_prescription);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                            )}
                            <div>
                              {product.name}
                              {product.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {product.description}
                                </div>
                              )}
                              {product.presentation && (
                                <div className="text-xs text-blue-600 mt-1">
                                  {product.presentation} {product.concentration && `- ${product.concentration}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {product.sku ? (
                              <Badge variant="outline">{product.sku}</Badge>
                            ) : (
                              <span className="text-muted-foreground italic">Sin SKU</span>
                            )}
                            {product.code && (
                              <Badge variant="secondary" className="text-xs">{product.code}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {((product as any)?.category?.name) || (
                              <span className="text-muted-foreground italic">Sin categoría</span>
                            )}
                            {product.laboratory && (
                              <span className="text-xs text-muted-foreground">{product.laboratory}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {((product as any)?.location?.name) || (
                            <span className="text-muted-foreground italic">Sin ubicación</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {getPriceDisplay(product.sale_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getPriceDisplay(product.purchase_price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">
                              {product.min_stock} - {product.max_stock}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.unit_type}
                            </div>
                            {product.expiry_date && (
                              <Badge variant="outline" className="text-xs">
                                Vence: {new Date(product.expiry_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente
                                    el producto "{product.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}