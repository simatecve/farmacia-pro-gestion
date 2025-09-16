import React, { useState } from 'react';
import { ProductWithStock } from '@/hooks/useProductsWithStock';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Package, DollarSign, ShoppingCart, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: ProductWithStock | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductWithStock, quantity: number) => void;
}

export function ProductDetails({ product, isOpen, onClose, onAddToCart }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [prescriptionChecked, setPrescriptionChecked] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.requires_prescription && !prescriptionChecked) {
      toast.error('Debe verificar la receta médica antes de agregar este producto al carrito');
      return;
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > product.current_stock) {
      toast.error(`No hay suficiente stock. Stock disponible: ${product.current_stock}`);
      return;
    }

    onAddToCart(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    onClose();
    setQuantity(1);
    setPrescriptionChecked(false);
  };

  const handleClose = () => {
    onClose();
    setQuantity(1);
    setPrescriptionChecked(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Header with Image */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 bg-muted rounded-lg border flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {product.requires_prescription && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Requiere Receta
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Alert */}
          {product.requires_prescription && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>¡Atención!</strong> Este producto requiere receta médica para su venta.
                Debe verificar y validar la receta antes de proceder con la venta.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Product Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Información del Producto</h4>
            
            <div className="grid grid-cols-2 gap-4">

              
              {product.barcode && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código de Barras:</span>
                  <span className="text-sm font-medium">{product.barcode}</span>
                </div>
              )}
              
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoría:</span>
                  <span className="text-sm font-medium">{product.category.name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo de Unidad:</span>
                <span className="text-sm font-medium">{product.unit_type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Precio de Venta:
                </span>
                <span className="text-sm font-medium text-green-600">
                  ${product.sale_price.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock Actual:</span>
                <span className={`text-sm font-medium ${
                  product.current_stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.current_stock} unidades
                </span>
              </div>
            </div>
            
            {/* Location Information */}
            {product.locations && product.locations.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Ubicaciones
                </h5>
                <div className="space-y-1">
                  {product.locations.map((location, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">{location.location_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {location.stock} unidades
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Agregar al Carrito</h4>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity" className="text-sm font-medium">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.current_stock}
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(newQuantity, product.current_stock));
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Total</Label>
                <div className="mt-1 p-2 bg-muted rounded text-lg font-semibold text-green-600">
                  ${(product.sale_price * quantity).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Prescription Verification */}
            {product.requires_prescription && (
              <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded">
                <Checkbox
                  id="prescription-check"
                  checked={prescriptionChecked}
                  onCheckedChange={(checked) => setPrescriptionChecked(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="prescription-check"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    He verificado y validado la receta médica
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Confirmo que el cliente ha presentado una receta médica válida para este producto.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleAddToCart} 
              className="flex-1 flex items-center gap-2"
              disabled={!product.active || (product.requires_prescription && !prescriptionChecked)}
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}