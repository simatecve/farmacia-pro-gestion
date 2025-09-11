import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus, Percent } from "lucide-react";
import { SaleItem } from "@/hooks/useSales";

interface POSCartProps {
  items: SaleItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateDiscount: (index: number, discount: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function POSCart({
  items,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onClearCart,
  subtotal,
  discount,
  tax,
  total
}: POSCartProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ticket de Venta</CardTitle>
          <Badge variant="secondary" className="text-sm px-2 py-1">{items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-6xl opacity-20 mb-4">🛒</div>
              <p className="text-lg">No hay productos en el carrito</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm border-gray-200">
                {/* Header con nombre del producto y botón eliminar */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base truncate text-gray-900">{item.product_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ${item.unit_price.toFixed(2)} por unidad
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 h-9 w-9 p-0 transition-all duration-200 ml-2"
                    title="Eliminar producto del carrito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Controles de cantidad y descuento */}
                <div className="space-y-3">
                  {/* Control de cantidad */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 transition-colors border-gray-300"
                        disabled={item.quantity <= 1}
                        title="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                          onUpdateQuantity(index, newQuantity);
                        }}
                        className="h-9 w-16 text-center text-sm font-medium border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="1"
                        title="Editar cantidad directamente"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="h-9 w-9 p-0 hover:bg-green-50 hover:border-green-300 transition-colors border-gray-300"
                        title="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600 ml-2">unidades</span>
                    </div>
                  </div>
                  
                  {/* Control de descuento */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Descuento</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">$</span>
                      <Input
                        type="number"
                        value={item.discount_amount}
                        onChange={(e) => onUpdateDiscount(index, parseFloat(e.target.value) || 0)}
                        className="h-9 w-24 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        title="Aplicar descuento en pesos"
                      />
                      <span className="text-sm text-gray-600">pesos</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal del item */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Subtotal del producto:</span>
                  <span className="font-bold text-lg text-blue-600">${item.total_price.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="flex-shrink-0 space-y-3">
            <Separator />
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuentos:</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>IVA (16%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClearCart}
              className="w-full h-8 text-sm"
              size="sm"
            >
              Limpiar Carrito
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}