import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Clock, DollarSign } from "lucide-react";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { POSCart } from "@/components/pos/POSCart";
import { POSCheckout } from "@/components/pos/POSCheckout";
import { useSales, SaleItem } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

export default function PointOfSale() {
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const { createSale, generateSaleNumber } = useSales();
  const { toast } = useToast();

  const addToCart = (product: any) => {
    const existingItemIndex = cartItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total_price = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
        discount_amount: 0,
        total_price: product.sale_price
      };
      setCartItems([...cartItems, newItem]);
    }

    toast({
      title: "Producto agregado",
      description: `${product.name} agregado al carrito`
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total_price = quantity * updatedItems[index].unit_price - updatedItems[index].discount_amount;
    setCartItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discount = cartItems.reduce((sum, item) => sum + item.discount_amount, 0);
    const tax = (subtotal - discount) * 0.16; // 16% IVA
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  const processSale = async (saleData: {
    client_id?: string;
    payment_method: string;
    notes?: string;
  }) => {
    try {
      const sale = {
        sale_number: generateSaleNumber(),
        total_amount: total,
        discount_amount: discount,
        tax_amount: tax,
        status: 'completed',
        payment_method: saleData.payment_method,
        client_id: saleData.client_id,
        notes: saleData.notes
      };

      await createSale(sale, cartItems);
      setCartItems([]);
      
      toast({
        title: "¡Venta completada!",
        description: `Venta ${sale.sale_number} procesada exitosamente`
      });
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Punto de Venta</h1>
          <p className="text-muted-foreground">Sistema de ventas en tiempo real</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Terminal POS</p>
                <p className="text-xs text-muted-foreground">Activo</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search */}
        <div className="lg:col-span-2">
          <ProductSearch onAddProduct={addToCart} />
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          <POSCart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
          />
          
          <POSCheckout
            items={cartItems}
            total={total}
            onProcessSale={processSale}
            disabled={cartItems.length === 0}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total de la venta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{cartItems.length}</p>
                <p className="text-xs text-muted-foreground">Productos en carrito</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Descuento: ${discount.toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                IVA: ${tax.toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}