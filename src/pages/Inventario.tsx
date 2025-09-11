import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Package, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { MovementForm } from '@/components/inventory/MovementForm';
import { AdvancedSearch, Product } from '@/components/inventory/AdvancedSearch';
import { useInventory } from '@/hooks/useInventory';

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { inventory, movements, loading } = useInventory();

  // Función mejorada de filtrado que incluye todos los campos del producto
  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.product?.name.toLowerCase().includes(searchLower) ||
      item.product?.sku?.toLowerCase().includes(searchLower) ||
      (item.product as any)?.barcode?.toLowerCase().includes(searchLower) ||
      (item.product as any)?.description?.toLowerCase().includes(searchLower) ||
      item.location?.name.toLowerCase().includes(searchLower) ||
      item.batch_number?.toLowerCase().includes(searchLower) ||
      (item.product as any)?.categories?.name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.product?.name.toLowerCase().includes(searchLower) ||
      movement.product?.sku?.toLowerCase().includes(searchLower) ||
      (movement.product as any)?.barcode?.toLowerCase().includes(searchLower) ||
      movement.location?.name.toLowerCase().includes(searchLower) ||
      movement.movement_type.toLowerCase().includes(searchLower) ||
      movement.notes?.toLowerCase().includes(searchLower)
    );
  });

  const lowStockItems = inventory.filter(item => item.available_stock <= 5);
  const expiringItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const today = new Date();
    const expiryDate = new Date(item.expiry_date);
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30 && diffDays >= 0;
  });

  const getStockStatus = (available: number, reserved: number) => {
    if (available <= 0) return { label: 'Sin Stock', variant: 'destructive' as const };
    if (available <= 5) return { label: 'Stock Bajo', variant: 'secondary' as const };
    return { label: 'En Stock', variant: 'default' as const };
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { label: 'Vencido', variant: 'destructive' as const };
    if (diffDays <= 30) return { label: `${diffDays} días`, variant: 'secondary' as const };
    return { label: `${diffDays} días`, variant: 'outline' as const };
  };

  const getMovementTypeLabel = (type: string) => {
    const types = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste',
      transferencia: 'Transferencia',
      venta: 'Venta',
      compra: 'Compra',
      devolucion: 'Devolución'
    };
    return types[type as keyof typeof types] || type;
  };

  const getMovementVariant = (type: string) => {
    switch (type) {
      case 'entrada':
      case 'compra':
      case 'devolucion':
        return 'default';
      case 'salida':
      case 'venta':
        return 'destructive';
      case 'ajuste':
        return 'secondary';
      case 'transferencia':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Control y seguimiento del inventario</p>
        </div>
        
        <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
            </DialogHeader>
            <MovementForm
              onSave={() => setShowMovementForm(false)}
              onCancel={() => setShowMovementForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas y Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
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
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold">{expiringItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Movimientos</p>
                <p className="text-2xl font-bold">{movements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventario Actual</TabsTrigger>
          <TabsTrigger value="movements">Kardex</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventario Actual ({filteredInventory.length})
                </CardTitle>
                <div className="max-w-md">
                  <AdvancedSearch
                    placeholder="Buscar en inventario por nombre, SKU, código de barras..."
                    onSearchChange={(term, results) => {
                      setSearchTerm(term);
                    }}
                    onProductSelect={(product) => {
                      setSelectedProduct(product);
                      setSearchTerm(product.name);
                    }}
                    showResults={false}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos en inventario'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Stock Total</TableHead>
                        <TableHead>Stock Disponible</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item.available_stock, item.reserved_stock);
                        const expiryStatus = getExpiryStatus(item.expiry_date);
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.product?.sku || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.location?.name || 'N/A'}</TableCell>
                            <TableCell>
                              {item.batch_number || (
                                <span className="text-muted-foreground italic">Sin lote</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.current_stock}
                              {item.reserved_stock > 0 && (
                                <span className="text-muted-foreground text-sm">
                                  ({item.reserved_stock} reservado)
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.available_stock}
                            </TableCell>
                            <TableCell>
                              {expiryStatus ? (
                                <Badge variant={expiryStatus.variant}>
                                  {expiryStatus.label}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground italic">Sin vencimiento</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.variant}>
                                {stockStatus.label}
                              </Badge>
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
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Kardex - Movimientos ({filteredMovements.length})
                </CardTitle>
                <div className="max-w-md">
                  <AdvancedSearch
                    placeholder="Buscar movimientos por producto, SKU, código de barras..."
                    onSearchChange={(term, results) => {
                      setSearchTerm(term);
                    }}
                    onProductSelect={(product) => {
                      setSelectedProduct(product);
                      setSearchTerm(product.name);
                    }}
                    showResults={false}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron movimientos' : 'No hay movimientos registrados'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Stock Anterior</TableHead>
                        <TableHead>Stock Posterior</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {new Date(movement.created_at).toLocaleDateString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.product?.name || 'N/A'}
                            {movement.product?.sku && (
                              <div className="text-xs text-muted-foreground">
                                {movement.product.sku}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{movement.location?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={getMovementVariant(movement.movement_type)}>
                              {getMovementTypeLabel(movement.movement_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </TableCell>
                          <TableCell className="text-right">{movement.stock_before}</TableCell>
                          <TableCell className="text-right font-medium">{movement.stock_after}</TableCell>
                          <TableCell className="text-right">
                            {movement.total_cost ? `$${movement.total_cost.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            {movement.notes ? (
                              <span className="text-sm text-muted-foreground">{movement.notes}</span>
                            ) : (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Stock Bajo ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay productos con stock bajo
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Stock Disponible</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowStockItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product?.name}</TableCell>
                            <TableCell>{item.location?.name}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {item.available_stock}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">Stock Bajo</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  Próximos a Vencer ({expiringItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiringItems.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay productos próximos a vencer
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Lote</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiringItems.map((item) => {
                          const expiryStatus = getExpiryStatus(item.expiry_date);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product?.name}</TableCell>
                              <TableCell>{item.batch_number || 'N/A'}</TableCell>
                              <TableCell>{item.location?.name}</TableCell>
                              <TableCell className="text-right">{item.available_stock}</TableCell>
                              <TableCell>
                                {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {expiryStatus && (
                                  <Badge variant={expiryStatus.variant}>
                                    {expiryStatus.label}
                                  </Badge>
                                )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}