import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  tax_rate: number;
}

interface QuoteCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const QuoteCart = ({ items, onUpdateQuantity, onRemoveItem }: QuoteCartProps) => {
  const calculateItemSubtotal = (item: CartItem) => {
    const priceWithTax = item.price;
    const taxAmount = (priceWithTax * item.tax_rate) / (1 + item.tax_rate);
    const priceWithoutTax = priceWithTax - taxAmount;
    return priceWithoutTax * item.quantity - item.discount;
  };

  const calculateItemTax = (item: CartItem) => {
    const priceWithTax = item.price;
    const taxAmount = (priceWithTax * item.tax_rate) / (1 + item.tax_rate);
    return taxAmount * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const tax = items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const total = subtotal + tax;

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-lg">Items del Presupuesto</h3>
      
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No hay items en el presupuesto
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
