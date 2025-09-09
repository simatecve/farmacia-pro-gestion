import { useState, useEffect } from "react";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { POSCart } from "@/components/pos/POSCart";
import { POSCheckout } from "@/components/pos/POSCheckout";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { useSales, SaleItem, Sale } from "@/hooks/useSales";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Clock, DollarSign, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProductWithStock } from "@/hooks/useProductsWithStock";

export default function PointOfSale() {
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  const { createSale, generateSaleNumber } = useSales();
  const { clients } = useClients();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Find the default client and selected client info
  useEffect(() => {
    const defaultClient = clients.find(client => client.name === 'CONSUMIDOR FINAL');
    if (defaultClient) {
      setSelectedClient(defaultClient);
    }
  }, [clients]);

  const addToCart = (product: ProductWithStock) => {
    const existingItemIndex = cartItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total_price = 
        (updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price) - updatedItems[existingItemIndex].discount_amount;
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
      description: `${product.name} agregado al carrito`,
      duration: 2000
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total_price = (quantity * updatedItems[index].unit_price) - updatedItems[index].discount_amount;
    setCartItems(updatedItems);
  };

  const updateDiscount = (index: number, discount: number) => {
    const updatedItems = [...cartItems];
    updatedItems[index].discount_amount = discount;
    updatedItems[index].total_price = (updatedItems[index].quantity * updatedItems[index].unit_price) - discount;
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
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.16; // 16% IVA
    const total = taxableAmount + tax;

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

      const createdSale = await createSale(sale, cartItems);
      
      // Set the completed sale with items for the receipt
      const saleWithItems = {
        ...createdSale,
        items: cartItems
      };
      setCompletedSale(saleWithItems);
      
      // Get client info for receipt
      const client = clients.find(c => c.id === saleData.client_id);
      setSelectedClient(client);
      
      // Show receipt modal
      setReceiptModalOpen(true);
      
      // Clear cart
      setCartItems([]);
      
      toast({
        title: "¡Venta completada!",
        description: `Venta ${sale.sale_number} procesada exitosamente`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Terminal POS</h1>
                <p className="text-sm text-muted-foreground">Daalef Farmacia</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-600">Online</p>
                  <p className="text-xs text-muted-foreground">Terminal Activo</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main POS Interface */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 h-[calc(100vh-200px)]">
            <ProductSearch onAddProduct={addToCart} />
          </div>

          {/* Right Sidebar - Cart and Checkout */}
          <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
            {/* Cart */}
            <div className="flex-1 min-h-0">
              <POSCart
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onUpdateDiscount={updateDiscount}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
              />
            </div>
            
            {/* Checkout - Fixed height */}
            <div className="flex-shrink-0">
              <POSCheckout
                items={cartItems}
                total={total}
                onProcessSale={processSale}
                disabled={cartItems.length === 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="border-t bg-muted/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xl font-bold">${total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Venta</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-xl font-bold">{cartItems.length}</p>
                <p className="text-xs text-muted-foreground">Productos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1">
                Desc: ${discount.toFixed(2)}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                IVA: ${tax.toFixed(2)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        sale={completedSale}
        client={selectedClient}
      />
    </div>
  );
}