import { Trash2, Minus, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
          <Package className="h-16 w-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay productos agregados</p>
          <p className="text-sm">Busca y agrega productos para crear el presupuesto</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="text-center font-semibold w-32">Cantidad</TableHead>
                  <TableHead className="text-right font-semibold w-32">P. Unitario</TableHead>
                  <TableHead className="text-right font-semibold w-32">Subtotal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          IVA {(item.tax_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${calculateItemSubtotal(item).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3 bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA:</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
