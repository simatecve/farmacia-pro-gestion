import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, Download, X } from "lucide-react";
import { Sale, SaleItem } from "@/hooks/useSales";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect } from "react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  client?: { name: string; identification_number?: string; };
}

export function ReceiptModal({ isOpen, onClose, sale, client }: ReceiptModalProps) {
  const { companySettings, taxSettings, printSettings } = useSettings();
  
  if (!sale) return null;

  // Get default tax or first available tax setting
  const defaultTax = taxSettings.find(tax => tax.is_default) || taxSettings[0];
  const taxRate = defaultTax ? defaultTax.rate : 0.16;
  const taxName = defaultTax ? defaultTax.name : 'IVA';

  const handlePrint = () => {
    // For thermal printers, we could send the text version
    // For now, we'll use the browser's print functionality
    if (printSettings?.auto_print) {
      // Auto print logic would go here
      console.log('Auto printing...');
    }
    window.print();
  };

  const generateReceiptText = () => {
    const receiptText = `
        QUINGA SANCHEZ JOHN WILFRIDO

        RUC: 1709738635001
Dirección: PICHINCHA / QUITO / LA MAGDALENA / OE
                7B OE7-42
Teléfono: 0987654321
Email: farmacia@daalef.com

        FACTURA DE VENTA
        N°: ${sale.sale_number}

Fecha: ${format(new Date(sale.created_at), "dd/MM/yyyy", { locale: es })}
Hora: ${format(new Date(sale.created_at), "HH:mm:ss", { locale: es })}
Cajero: QUINGA SANCHEZ JOHN WILFRIDO
Cliente: ${client?.name || 'CONSUMIDOR FINAL'}
${client?.identification_number ? `Cédula: ${client.identification_number}` : ''}

================================================
Cant  Descripción                      Total
================================================
${sale.items?.map(item => 
  `${item.quantity.toString().padEnd(4)} ${item.product_name.padEnd(30)} ${item.total_price.toFixed(2).padStart(8)}`
).join('\n') || ''}
================================================

                    Subtotal 0%:    ${(sale.total_amount - sale.tax_amount).toFixed(2)}
                    Subtotal 15%:   0.00
                    ${taxName} 15%:        ${sale.tax_amount.toFixed(2)}
                    Descuento:      ${(sale.discount_amount || 0).toFixed(2)}
                    TOTAL:          ${sale.total_amount.toFixed(2)}

Forma de Pago: ${getPaymentMethodLabel(sale.payment_method || '')}
Efectivo Recibido:              ${sale.total_amount.toFixed(2)}
Cambio:                         0.00

        Gracias por su compra
        QUINGA SANCHEZ JOHN WILFRIDO
    `;
    return receiptText;
  };

  const handleDownload = () => {
    const receiptText = generateReceiptText();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${sale.sale_number}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'EFECTIVO';
      case 'card': return 'TARJETA';
      case 'transfer': return 'TRANSFERENCIA';
      default: return method?.toUpperCase();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between">
            <DialogTitle>Ticket de Venta</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <Card className="receipt-print">
            <CardContent className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold">QUINGA SANCHEZ JOHN WILFRIDO</h2>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>RUC: 1709738635001</p>
                  <p>Dirección: PICHINCHA / QUITO / LA MAGDALENA / OE</p>
                  <p className="text-center">7B OE7-42</p>
                  <p>Teléfono: 0987654321</p>
                  <p>Email: farmacia@daalef.com</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold">FACTURA DE VENTA</h3>
                  <p className="text-sm">N°: {sale.sale_number}</p>
                </div>
              </div>

            <Separator className="mb-4" />

            {/* Sale Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fecha:</span>
                <span>{format(new Date(sale.created_at), "dd/MM/yyyy", { locale: es })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Hora:</span>
                <span>{format(new Date(sale.created_at), "HH:mm:ss", { locale: es })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Cajero:</span>
                <span>QUINGA SANCHEZ JOHN WILFRIDO</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Cliente:</span>
                <span>{client?.name || 'CONSUMIDOR FINAL'}</span>
              </div>
              {client?.identification_number && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Cédula:</span>
                  <span>{client.identification_number}</span>
                </div>
              )}
            </div>

            <Separator className="mb-4" />

            {/* Products */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-medium">
                <div className="col-span-1">PRODUCTO</div>
                <div className="col-span-1 text-center">CANT</div>
                <div className="col-span-1 text-right">PRECIO</div>
                <div className="col-span-1 text-right">TOTAL</div>
              </div>
              <Separator />
              {sale.items?.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm font-medium">{item.product_name}</div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center">{item.quantity}</div>
                    <div className="col-span-1 text-right">${item.unit_price.toFixed(2)}</div>
                    <div className="col-span-1 text-right">${item.total_price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal 0%:</span>
                <span>{(sale.total_amount - sale.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal 15%:</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{taxName} 15%:</span>
                <span>{sale.tax_amount.toFixed(2)}</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span>{sale.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>{sale.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Payment Method */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Forma de Pago:</span>
                <span>{getPaymentMethodLabel(sale.payment_method || '')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Efectivo Recibido:</span>
                <span>{sale.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Cambio:</span>
                <span>0.00</span>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Footer */}
            <div className="text-center text-sm space-y-2">
              <p className="font-medium">Gracias por su compra</p>
              <p className="font-bold">QUINGA SANCHEZ JOHN WILFRIDO</p>
            </div>
          </CardContent>
        </Card>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 no-print">
          <Button onClick={handlePrint} className="flex-1" variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload} className="flex-1" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button onClick={onClose} className="flex-1">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Print styles
const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }
  
  .receipt-print {
    width: 80mm;
    margin: 0;
    box-shadow: none;
    border: none;
  }
  
  .receipt-print * {
    font-size: 12px !important;
    line-height: 1.2 !important;
  }
  
  .receipt-print h2 {
    font-size: 16px !important;
    font-weight: bold !important;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  @page {
    margin: 0;
    size: 80mm auto;
  }
}
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}