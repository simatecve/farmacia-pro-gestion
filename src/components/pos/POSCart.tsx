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
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Ticket de Venta</CardTitle>
          <Badge variant="secondary" className="text-lg px-3 py-1">{items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-6xl opacity-20 mb-4">🛒</div>
              <p className="text-lg">No hay productos en el carrito</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-accent/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base truncate">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.unit_price.toFixed(2)} c/u
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cantidad</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Descuento $</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        value={item.discount_amount}
                        onChange={(e) => onUpdateDiscount(index, parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                      <Percent className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-bold text-lg">${item.total_price.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="flex-shrink-0 space-y-4">
            <Separator />
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Descuentos:</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base">
                <span>IVA (16%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold text-primary">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClearCart}
              className="w-full py-3"
              size="lg"
            >
              Limpiar Carrito
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}