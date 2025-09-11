import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Package } from 'lucide-react';
import { usePurchaseOrders, type PurchaseOrder, type PurchaseOrderItem } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder;
  onSuccess?: () => void;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function PurchaseOrderForm({ purchaseOrder, onSuccess }: PurchaseOrderFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();

  const [formData, setFormData] = useState({
    supplier_id: purchaseOrder?.supplier_id || '',
    status: purchaseOrder?.status || 'pending' as const,
    order_date: purchaseOrder?.order_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    expected_delivery_date: purchaseOrder?.expected_delivery_date?.split('T')[0] || '',
    notes: purchaseOrder?.notes || '',
  });

  useEffect(() => {
    if (purchaseOrder?.items) {
      setItems(purchaseOrder.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })));
    }
  }, [purchaseOrder]);

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.purchase_price || 0;
      }
    }
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.19; // 19% IVA
    const totalAmount = subtotal + taxAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_id) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }
    
    if (items.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0)) {
      toast.error('Todos los productos deben tener cantidad y precio válidos');
      return;
    }

    setLoading(true);
    
    try {
      const { subtotal, taxAmount, totalAmount } = calculateTotals();
      
      const orderData = {
        ...formData,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      };

      const result = purchaseOrder
        ? await updatePurchaseOrder(purchaseOrder.id, orderData)
        : await createPurchaseOrder(orderData, items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          })));

      if (result.success) {
        toast.success({
          title: "¡Éxito!",
          description: purchaseOrder ? "Orden de compra actualizada correctamente" : "Orden de compra creada correctamente"
        });
        
        setOpen(false);
        onSuccess?.();
        
        if (!purchaseOrder) {
          setFormData({
            supplier_id: '',
            status: 'pending',
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: '',
            notes: '',
          });
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {purchaseOrder ? (
            <>
              <Package className="h-4 w-4" />
              Editar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Nueva Orden de Compra
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {purchaseOrder ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Proveedor *</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.active).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="received">Recibida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order_date">Fecha de Orden *</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Fecha de Entrega Esperada</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre la orden..."
              rows={3}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Productos</CardTitle>
                <Button type="button" onClick={addItem} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unitario</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => updateItem(index, 'product_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${item.total_price.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="flex justify-end">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between gap-8">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span>IVA (19%):</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-8 font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay productos agregados</p>
                  <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : purchaseOrder ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}