import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Smartphone, User, UserPlus, Percent, Printer, DollarSign as CashDrawer } from "lucide-react";
import { SaleItem } from "@/hooks/useSales";
import { useClients } from "@/hooks/useClients";
import { ClientSearch } from "./ClientSearch";

import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useToast } from "@/hooks/use-toast";

interface POSCheckoutProps {
  items: SaleItem[];
  total: number;
  subtotal: number;
  discount: number;
  onProcessSale: (saleData: {
    client_id?: string;
    payment_method: string;
    notes?: string;
    cash_received?: number;
    change_amount?: number;
  }) => Promise<void>;
  onDiscountChange: (discount: number) => void;
  disabled: boolean;
}

export function POSCheckout({ items, total, subtotal, discount, onProcessSale, onDiscountChange, disabled }: POSCheckoutProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [cashReceived, setCashReceived] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const { clients } = useClients();
  const { toast } = useToast();
  const { 
    printReceipt, 
    openCashDrawer, 
    getDevicesByType 
  } = useDeviceDetection();

  const printers = getDevicesByType('printer');
  const cashDrawers = getDevicesByType('cash_drawer');

  // Set default client to CONSUMIDOR FINAL
  useEffect(() => {
    const defaultClient = clients.find(client => client.name === 'CONSUMIDOR FINAL');
    if (defaultClient && !clientId) {
      setClientId(defaultClient.id);
    }
  }, [clients]);

  const handleDiscountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setDiscountAmount(amount);
    
    let finalDiscount = 0;
    if (discountType === 'percentage') {
      finalDiscount = (subtotal * amount) / 100;
    } else {
      finalDiscount = amount;
    }
    
    onDiscountChange(finalDiscount);
  };

  const handleCashAmountChange = (amountPaid: number, change: number) => {
    setCashReceived(amountPaid);
    setChangeAmount(change);
  };

  const handlePointsRedemption = (points: number) => {
    setPointsToRedeem(points);
    // 1 punto = $0.01 (ajustar según la configuración del negocio)
    const discount = points * 0.01;
    setPointsDiscount(discount);
  };

  // Calcular total final con descuentos y puntos
  const finalTotal = Math.max(0, total - pointsDiscount);

  const handleProcessSale = async () => {
    if (!paymentMethod) return;
    if (paymentMethod === 'cash' && cashReceived < finalTotal) return;

    setProcessing(true);
    try {
      await onProcessSale({
        client_id: clientId || undefined,
        payment_method: paymentMethod,
        notes: notes || undefined,
        cash_received: paymentMethod === 'cash' ? cashReceived : undefined,
        change_amount: paymentMethod === 'cash' ? changeAmount : undefined,
        total: finalTotal,
        discount: discount + pointsDiscount,
        points_redeemed: pointsToRedeem
      });

      // Procesos automáticos post-venta
      await handlePostSaleActions();
      
      // Reset form
      setPaymentMethod("");
      setNotes("");
      setDiscountAmount(0);
      setCashReceived(0);
      setChangeAmount(0);
      setPointsToRedeem(0);
      setPointsDiscount(0);
      onDiscountChange(0);
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

  const handlePostSaleActions = async () => {
    try {
      // 1. Imprimir ticket automáticamente
      if (printers.length > 0) {
        const receiptData = {
          companyName: 'FARMACIA PRO',
          address: 'Dirección de la farmacia',
          phone: 'Teléfono de contacto',
          ticketNumber: `TKT-${Date.now()}`,
          items: items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price
          })),
          subtotal,
          discount,
          total,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
          changeAmount: paymentMethod === 'cash' ? changeAmount : undefined,
          clientName: selectedClient?.name
        };

        const success = await printReceipt(JSON.stringify(receiptData), printers[0].vendorId.toString());
        if (success) {
          toast({
            title: "Ticket impreso",
            description: "El ticket se ha impreso correctamente",
          });
        }
      }

      // 2. Abrir gaveta de dinero para pagos en efectivo
      if (paymentMethod === 'cash' && cashDrawers.length > 0) {
        const success = await openCashDrawer(cashDrawers[0].vendorId.toString());
        if (success) {
          toast({
            title: "Gaveta abierta",
            description: "La gaveta de dinero se ha abierto automáticamente",
          });
        }
      }
    } catch (error) {
      console.error('Error en acciones post-venta:', error);
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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Finalizar Venta
          </CardTitle>
          <div className="flex gap-1">
            {printers.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Printer className="h-3 w-3 mr-1" />
                Impresora
              </Badge>
            )}
            {cashDrawers.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <CashDrawer className="h-3 w-3 mr-1" />
                Gaveta
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">


        {/* Client Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="h-3 w-3" />
            Cliente
          </Label>
          <ClientSearch
            onClientSelect={(client) => setClientId(client.id)}
            selectedClientId={clientId}
            placeholder="Buscar cliente..."
            showAddNew={true}
          />
          
          {selectedClient && (
            <div className="text-sm p-2 bg-accent/20 rounded">
              <p className="font-medium text-sm">{selectedClient.name}</p>
              {selectedClient.phone !== '0000000' && (
                <p className="text-xs text-muted-foreground">{selectedClient.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Total Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="space-y-1">
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
            <div className="flex justify-between border-t pt-1">
              <span className="font-medium">Total a Pagar:</span>
              <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">{items.length} productos</p>
          </div>
        </div>

        {/* Process Sale Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full h-10 text-sm font-semibold" 
              size="default"
              disabled={disabled || items.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Procesar Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirmar Venta</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="text-center p-6 bg-accent/20 rounded-lg">
                  <div className="space-y-1">
                    {discount > 0 && (
                      <>
                        <p className="text-sm text-muted-foreground">Subtotal: ${subtotal.toFixed(2)}</p>
                        <p className="text-sm text-green-600">Descuento: -${discount.toFixed(2)}</p>
                      </>
                    )}
                    <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{items.length} productos</p>
                  <p className="text-sm font-medium mt-2">{selectedClient?.name}</p>
                </div>

                {/* Discount Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-3 w-3" />
                    Descuento
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={discountType} 
                      onValueChange={(value: 'amount' | 'percentage') => setDiscountType(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">$</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={discountType === 'percentage' ? "100" : undefined}
                      placeholder="0"
                      value={discountAmount || ""}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {discount > 0 && (
                  <p className="text-sm text-green-600">
                    Descuento aplicado: ${discount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Canje de Puntos */}
              {selectedClient && selectedClient.points > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Canjear Puntos ({selectedClient.points} disponibles)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={pointsToRedeem}
                      onChange={(e) => {
                        const points = Math.min(Number(e.target.value) || 0, selectedClient.points);
                        handlePointsRedemption(points);
                      }}
                      className="flex-1"
                      min="0"
                      max={selectedClient.points}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePointsRedemption(selectedClient.points)}
                    >
                      Máx
                    </Button>
                  </div>
                  {pointsDiscount > 0 && (
                    <p className="text-sm text-green-600">
                      Equivalente a un descuento de ${pointsDiscount.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
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

                {/* Cash Payment Input */}
                {paymentMethod === 'cash' && (
                  <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="cash-received">Monto Recibido</Label>
                      <Input
                        id="cash-received"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={cashReceived || ''}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setCashReceived(amount);
                          setChangeAmount(Math.max(0, amount - finalTotal));
                        }}
                        className="text-lg font-semibold"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total a pagar:</span>
                        <p className="font-semibold text-lg">${finalTotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cambio:</span>
                        <p className={`font-semibold text-lg ${
                          changeAmount > 0 ? 'text-green-600' : 
                          cashReceived < total ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          ${changeAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {cashReceived > 0 && cashReceived < finalTotal && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        ⚠️ Monto insuficiente. Faltan ${(finalTotal - cashReceived).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

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
                    disabled={
                      !paymentMethod || 
                      processing || 
                      (paymentMethod === 'cash' && cashReceived < finalTotal)
                    }
                    className="flex-1"
                  >
                    {processing ? "Procesando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
