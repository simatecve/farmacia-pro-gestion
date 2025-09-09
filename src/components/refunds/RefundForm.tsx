import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { useRefunds, Sale, RefundItem } from "@/hooks/useRefunds";

interface RefundFormProps {
  onRefundCreated?: () => void;
}

export function RefundForm({ onRefundCreated }: RefundFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refundQuantities, setRefundQuantities] = useState<{ [key: string]: number }>({});
  const [refundReason, setRefundReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [processing, setProcessing] = useState(false);

  const { sales, createRefund, loading } = useRefunds();

  const selectedSale = sales.find(sale => sale.id === selectedSaleId);

  const refundMethods = [
    { value: "cash", label: "Efectivo", icon: DollarSign },
    { value: "card", label: "Tarjeta", icon: CreditCard },
    { value: "transfer", label: "Transferencia", icon: Smartphone },
    { value: "store_credit", label: "Crédito en Tienda", icon: RotateCcw }
  ];

  const handleItemToggle = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
      const item = selectedSale?.sale_items.find(i => i.id === itemId);
      if (item) {
        setRefundQuantities({
          ...refundQuantities,
          [itemId]: item.quantity
        });
      }
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
      const newQuantities = { ...refundQuantities };
      delete newQuantities[itemId];
      setRefundQuantities(newQuantities);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setRefundQuantities({
      ...refundQuantities,
      [itemId]: quantity
    });
  };

  const calculateRefundAmount = () => {
    if (!selectedSale) return 0;
    
    return selectedItems.reduce((total, itemId) => {
      const item = selectedSale.sale_items.find(i => i.id === itemId);
      const quantity = refundQuantities[itemId] || 0;
      if (item && quantity > 0) {
        return total + (item.unit_price * quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedSale || selectedItems.length === 0 || !refundReason || !refundMethod) {
      return;
    }

    setProcessing(true);
    try {
      const refundItems: RefundItem[] = selectedItems.map(itemId => {
        const item = selectedSale.sale_items.find(i => i.id === itemId)!;
        const quantity = refundQuantities[itemId];
        return {
          product_id: item.product_id,
          quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * quantity,
          product_name: item.product.name
        };
      });

      await createRefund({
        sale_id: selectedSale.id,
        client_id: selectedSale.client_id,
        refund_reason: refundReason,
        refund_method: refundMethod,
        refund_amount: calculateRefundAmount(),
        items_refunded: refundItems
      });

      // Reset form
      setSelectedSaleId("");
      setSelectedItems([]);
      setRefundQuantities({});
      setRefundReason("");
      setRefundMethod("");
      setIsOpen(false);
      onRefundCreated?.();
    } catch (error) {
      console.error('Error creating refund:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <RotateCcw className="h-4 w-4 mr-2" />
          Nueva Devolución
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Devolución</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Selection */}
          <div className="space-y-2">
            <Label>Seleccionar Venta</Label>
            <Select value={selectedSaleId} onValueChange={setSelectedSaleId}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar venta por número..." />
              </SelectTrigger>
              <SelectContent>
                {sales.slice(0, 50).map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">#{sale.sale_number}</span>
                      <span className="text-sm text-muted-foreground">
                        ${sale.total_amount.toFixed(2)} - {sale.client?.name || 'Sin cliente'} - {new Date(sale.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Details and Item Selection */}
          {selectedSale && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Detalles de Venta #{selectedSale.sale_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{selectedSale.client?.name || 'Sin cliente'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Original</p>
                    <p className="font-medium">${selectedSale.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Seleccionar Productos a Devolver</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Cant. Vendida</TableHead>
                        <TableHead>Cant. a Devolver</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSale.sale_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => 
                                handleItemToggle(item.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              {item.product.sku && (
                                <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {selectedItems.includes(item.id) && (
                              <Input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={refundQuantities[item.id] || 1}
                                onChange={(e) => 
                                  handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                                }
                                className="w-20"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedItems.includes(item.id) && (
                              <span className="font-medium">
                                ${((refundQuantities[item.id] || 1) * item.unit_price).toFixed(2)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refund Details */}
          {selectedItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Motivo de Devolución *</Label>
                  <Textarea
                    placeholder="Describe el motivo de la devolución..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Método de Devolución *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {refundMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <Button
                          key={method.value}
                          variant={refundMethod === method.value ? "default" : "outline"}
                          onClick={() => setRefundMethod(method.value)}
                          className="justify-start"
                        >
                          <IconComponent className="h-4 w-4 mr-2" />
                          {method.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Devolución</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Productos seleccionados:</span>
                      <span>{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total a devolver:</span>
                      <span>${calculateRefundAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                processing || 
                selectedItems.length === 0 || 
                !refundReason || 
                !refundMethod
              }
            >
              {processing ? "Procesando..." : "Crear Devolución"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}