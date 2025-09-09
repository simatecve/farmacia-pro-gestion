import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Printer, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sale } from "@/hooks/useSales";

interface SalesHistoryTableProps {
  sales: Sale[];
  onRefresh?: () => void;
}

export function SalesHistoryTable({ sales, onRefresh }: SalesHistoryTableProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method || 'N/A';
    }
  };

  const handlePrint = (sale: Sale) => {
    // Create print content
    const printContent = `
      <div style="width: 300px; font-family: monospace; font-size: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>FARMACIA DAALEF</h2>
          <p>Reimpresión de Ticket</p>
          <p>Venta: ${sale.sale_number}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Fecha: ${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
          <p>Estado: ${getStatusLabel(sale.status)}</p>
          <p>Pago: ${getPaymentMethodLabel(sale.payment_method || '')}</p>
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;">
          <p><strong>PRODUCTOS</strong></p>
        </div>
        
        ${sale.items?.map(item => `
          <div style="margin-bottom: 5px;">
            <p>${item.product_name || 'Producto'}</p>
            <p>${item.quantity} x $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}</p>
          </div>
        `).join('') || ''}
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;">
          <p><strong>TOTAL: $${sale.total_amount.toFixed(2)}</strong></p>
        </div>
        
        ${sale.notes ? `<p>Notas: ${sale.notes}</p>` : ''}
        
        <div style="text-align: center; margin-top: 20px;">
          <p>¡Gracias por su compra!</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Ticket - ${sale.sale_number}</title></head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Historial de Ventas</h3>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-muted-foreground">
                  <p>No se encontraron ventas</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.sale_number}</TableCell>
                <TableCell>
                  {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                </TableCell>
                <TableCell className="font-semibold">${sale.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(sale.status)}>
                    {getStatusLabel(sale.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getPaymentMethodLabel(sale.payment_method || '')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSale(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de Venta - {sale.sale_number}</DialogTitle>
                        </DialogHeader>
                        {selectedSale && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Fecha:</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedSale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Estado:</p>
                                <Badge variant={getStatusColor(selectedSale.status)}>
                                  {getStatusLabel(selectedSale.status)}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Método de Pago:</p>
                                <p className="text-sm text-muted-foreground">
                                  {getPaymentMethodLabel(selectedSale.payment_method || '')}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Total:</p>
                                <p className="text-lg font-bold">${selectedSale.total_amount.toFixed(2)}</p>
                              </div>
                            </div>

                            {selectedSale.items && selectedSale.items.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Productos:</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Producto</TableHead>
                                      <TableHead>Cantidad</TableHead>
                                      <TableHead>Precio Unit.</TableHead>
                                      <TableHead>Descuento</TableHead>
                                      <TableHead>Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedSale.items.map((item: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>{item.product_name || 'Producto'}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                                        <TableCell>${(item.discount_amount || 0).toFixed(2)}</TableCell>
                                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                            {selectedSale.notes && (
                              <div>
                                <p className="text-sm font-medium">Notas:</p>
                                <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint(sale)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}