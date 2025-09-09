import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, DollarSign, Smartphone, User, UserPlus } from "lucide-react";
import { SaleItem } from "@/hooks/useSales";
import { useClients } from "@/hooks/useClients";

interface POSCheckoutProps {
  items: SaleItem[];
  total: number;
  onProcessSale: (saleData: {
    client_id?: string;
    payment_method: string;
    notes?: string;
  }) => Promise<void>;
  disabled: boolean;
}

export function POSCheckout({ items, total, onProcessSale, disabled }: POSCheckoutProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { clients } = useClients();

  // Set default client to CONSUMIDOR FINAL
  useEffect(() => {
    const defaultClient = clients.find(client => client.name === 'CONSUMIDOR FINAL');
    if (defaultClient && !clientId) {
      setClientId(defaultClient.id);
    }
  }, [clients, clientId]);

  const handleProcessSale = async () => {
    if (!paymentMethod) return;

    setProcessing(true);
    try {
      await onProcessSale({
        client_id: clientId || undefined,
        payment_method: paymentMethod,
        notes: notes || undefined
      });
      
      // Reset form
      setPaymentMethod("");
      setNotes("");
      // Keep default client selected
      const defaultClient = clients.find(client => client.name === 'CONSUMIDOR FINAL');
      setClientId(defaultClient?.id || "");
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Efectivo", icon: DollarSign, color: "text-green-600" },
    { value: "card", label: "Tarjeta", icon: CreditCard, color: "text-blue-600" },
    { value: "transfer", label: "Transferencia", icon: Smartphone, color: "text-purple-600" }
  ];

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Finalizar Venta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Cliente
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    {client.identification_number !== '0000000' && (
                      <span className="text-sm text-muted-foreground">
                        {client.identification_number}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedClient && (
            <div className="p-3 bg-accent/20 rounded-lg">
              <p className="font-medium">{selectedClient.name}</p>
              {selectedClient.phone !== '0000000' && (
                <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Total Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
          <p className="text-4xl font-bold text-primary">${total.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">{items.length} productos</p>
        </div>

        {/* Process Sale Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full h-14 text-lg font-semibold" 
              size="lg"
              disabled={disabled || items.length === 0}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Procesar Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirmar Venta</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center p-6 bg-accent/20 rounded-lg">
                <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{items.length} productos</p>
                <p className="text-sm font-medium mt-2">{selectedClient?.name}</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="payment-method" className="text-base font-medium">
                  Método de Pago *
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <Button
                        key={method.value}
                        variant={paymentMethod === method.value ? "default" : "outline"}
                        onClick={() => setPaymentMethod(method.value)}
                        className="justify-start h-12"
                      >
                        <IconComponent className={`h-5 w-5 mr-3 ${method.color}`} />
                        {method.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre la venta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleProcessSale}
                  disabled={!paymentMethod || processing}
                  className="flex-1"
                >
                  {processing ? "Procesando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
