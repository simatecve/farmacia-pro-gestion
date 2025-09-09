import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, DollarSign, Smartphone } from "lucide-react";
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
      setClientId("");
      setNotes("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Efectivo", icon: DollarSign },
    { value: "card", label: "Tarjeta", icon: CreditCard },
    { value: "transfer", label: "Transferencia", icon: Smartphone }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Finalizar Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{items.length} productos</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full" 
                size="lg"
                disabled={disabled || items.length === 0}
              >
                Procesar Venta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Finalizar Venta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{items.length} productos</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Método de Pago *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Cliente (Opcional)</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                <div className="flex gap-2">
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
                    {processing ? "Procesando..." : "Confirmar Venta"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}