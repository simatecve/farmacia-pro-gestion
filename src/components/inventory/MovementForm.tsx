import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
import { useLocations } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';
import { AdvancedSearch } from '@/components/inventory/AdvancedSearch';

interface MovementFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export function MovementForm({ onSave, onCancel }: MovementFormProps) {
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    movement_type: '' as 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'venta' | 'compra' | 'devolucion' | '',
    quantity: 0,
    unit_cost: '',
    batch_number: '',
    expiry_date: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const { createMovement, updateInventoryStock, inventory } = useInventory();
  const { products } = useProducts();
  const { locations } = useLocations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.location_id || !formData.movement_type || formData.quantity === 0) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben ser completados",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Obtener stock actual
      const currentInventory = inventory.find(
        item => item.product_id === formData.product_id && 
                item.location_id === formData.location_id &&
                item.batch_number === (formData.batch_number || null)
      );
      
      const currentStock = currentInventory?.current_stock || 0;
      let newStock = currentStock;
      
      // Calcular nuevo stock según tipo de movimiento
      switch (formData.movement_type) {
        case 'entrada':
        case 'compra':
        case 'devolucion':
          newStock = currentStock + Math.abs(formData.quantity);
          break;
        case 'salida':
        case 'venta':
          newStock = currentStock - Math.abs(formData.quantity);
          break;
        case 'ajuste':
          newStock = Math.abs(formData.quantity);
          break;
        case 'transferencia':
          // Para transferencias se manejará en el futuro con más lógica
          newStock = currentStock - Math.abs(formData.quantity);
          break;
      }

      if (newStock < 0) {
        toast({
          title: "Error",
          description: "No hay suficiente stock disponible",
          variant: "destructive"
        });
        return;
      }

      // Crear movimiento
      const movementData = {
        product_id: formData.product_id,
        location_id: formData.location_id,
        movement_type: formData.movement_type,
        quantity: formData.movement_type === 'salida' || formData.movement_type === 'venta' ? 
                  -Math.abs(formData.quantity) : Math.abs(formData.quantity),
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        total_cost: formData.unit_cost ? parseFloat(formData.unit_cost) * Math.abs(formData.quantity) : null,
        batch_number: formData.batch_number || null,
        expiry_date: formData.expiry_date || null,
        notes: formData.notes || null,
        user_id: null, // Aquí se podría agregar el usuario autenticado
        stock_before: currentStock,
        stock_after: newStock,
        reference_id: null,
        reference_type: null
      };

      await createMovement(movementData);
      
      // Actualizar inventario
      await updateInventoryStock(
        formData.product_id,
        formData.location_id,
        formData.batch_number || null,
        newStock
      );

      toast({
        title: "Éxito",
        description: "Movimiento de inventario registrado correctamente"
      });

      // Limpiar formulario
      setFormData({
        product_id: '',
        location_id: '',
        movement_type: '',
        quantity: 0,
        unit_cost: '',
        batch_number: '',
        expiry_date: '',
        notes: ''
      });

      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error registrando movimiento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Movimiento de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Producto *</Label>
              <AdvancedSearch
                onProductSelect={(product) => updateField('product_id', product.id)}
                placeholder="Buscar producto por nombre, SKU o código de barras..."
                selectedProductId={formData.product_id}
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Select value={formData.location_id} onValueChange={(value) => updateField('location_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="movement_type">Tipo de Movimiento *</Label>
              <Select value={formData.movement_type} onValueChange={(value) => updateField('movement_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de movimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="devolucion">Devolución</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                placeholder="Cantidad"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_cost">Costo Unitario</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => updateField('unit_cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch_number">Número de Lote</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => updateField('batch_number', e.target.value)}
                placeholder="Número de lote"
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => updateField('expiry_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Notas adicionales sobre el movimiento"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}