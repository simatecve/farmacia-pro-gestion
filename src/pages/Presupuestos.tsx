import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ClientSearch } from "@/components/pos/ClientSearch";
import { QuoteCart } from "@/components/quotes/QuoteCart";
import { QuoteCheckout } from "@/components/quotes/QuoteCheckout";
import { QuotePDF } from "@/components/quotes/QuotePDF";
import { useQuotes } from "@/hooks/useQuotes";
import { useSettings } from "@/hooks/useSettings";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  tax_rate: number;
}

export default function Presupuestos() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { quotes, loading, createQuote, fetchQuotes } = useQuotes();
  const { companySettings } = useSettings();

  const handleProductSelect = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: parseFloat(product.sale_price),
        discount: 0,
        tax_rate: product.tax_rate || 0.15
      }]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;

    cart.forEach(item => {
      const priceWithTax = item.price;
      const taxAmount = (priceWithTax * item.tax_rate) / (1 + item.tax_rate);
      const priceWithoutTax = priceWithTax - taxAmount;
      
      subtotal += priceWithoutTax * item.quantity - item.discount;
      tax += taxAmount * item.quantity;
    });

    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const handleGenerateQuote = async (data: { notes: string; valid_until: string }) => {
    if (cart.length === 0) return;

    const totals = calculateTotals();
    
    const quoteData = {
      client_id: selectedClient?.id,
      total_amount: totals.total,
      discount_amount: 0,
      tax_amount: totals.tax,
      status: 'pending',
      notes: data.notes,
      valid_until: data.valid_until || undefined
    };

    const items = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      discount_amount: item.discount,
      total_price: item.price * item.quantity - item.discount
    }));

    try {
      const quote = await createQuote(quoteData, items);
      
      // Prepare quote for PDF
      setCurrentQuote({
        ...quote,
        client_name: selectedClient?.name || "CONSUMIDOR FINAL",
        items: cart.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity - item.discount
        })),
        ...totals
      });
      
      setShowPDF(true);
      setCart([]);
      setSelectedClient(null);
      fetchQuotes();
    } catch (error) {
      console.error("Error creating quote:", error);
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Presupuestos
            </h1>
            <p className="text-muted-foreground">
              Crea y gestiona presupuestos para tus clientes
            </p>
          </div>
        </div>

        {/* Nuevo Presupuesto */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Crear Nuevo Presupuesto
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información del Cliente */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Información del Cliente
                </h4>
                <ClientSearch
                  onClientSelect={setSelectedClient}
                  selectedClientId={selectedClient?.id}
                />
                {selectedClient && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium">{selectedClient.name}</p>
                    {selectedClient.email && <p className="text-muted-foreground">{selectedClient.email}</p>}
                    {selectedClient.phone && <p className="text-muted-foreground">{selectedClient.phone}</p>}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Agregar Productos
                </h4>
                <ProductSearch onAddProduct={handleProductSelect} />
              </div>
            </div>

            {/* Detalles del Presupuesto */}
            <div className="space-y-6">
              <QuoteCheckout
                onGenerateQuote={handleGenerateQuote}
                loading={loading}
              />
            </div>
          </div>

          {/* Lista de Productos */}
          {cart.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Productos Seleccionados
              </h4>
              <QuoteCart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          )}
        </Card>

        {/* Lista de Presupuestos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Presupuestos Recientes</h3>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar presupuesto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Válido hasta</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quote_number}</TableCell>
                  <TableCell>{quote.client_name}</TableCell>
                  <TableCell>{format(new Date(quote.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {quote.valid_until ? format(new Date(quote.valid_until), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right">${quote.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status === 'pending' && 'Pendiente'}
                      {quote.status === 'approved' && 'Aprobado'}
                      {quote.status === 'rejected' && 'Rechazado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* PDF Modal */}
        {currentQuote && (
          <QuotePDF
            open={showPDF}
            onClose={() => setShowPDF(false)}
            quote={currentQuote}
            companyInfo={{
              name: companySettings?.name || "Mi Empresa",
              address: companySettings?.address,
              phone: companySettings?.phone,
              email: companySettings?.email
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
