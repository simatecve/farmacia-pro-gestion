import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { SaleItem } from "@/hooks/useSales";

interface POSCartProps {
  items: SaleItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
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
  onRemoveItem,
  onClearCart,
  subtotal,
  discount,
  tax,
  total
}: POSCartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Carrito de Compras</CardTitle>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-2">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay productos en el carrito
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.unit_price.toFixed(2)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right ml-2">
                  <p className="font-medium text-sm">${item.total_price.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Impuestos:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClearCart}
              className="w-full"
            >
              Limpiar Carrito
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}