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
    const companyName = companySettings?.company_name || 'QUINGA SANCHEZ JOHN WILFRIDO';
    const companyRuc = companySettings?.tax_id || '1709738635001';
    const companyAddress = companySettings?.address || 'PICHINCHA / QUITO / LA MAGDALENA / OE 7B OE7-42';
    const companyPhone = companySettings?.phone || '0987654321';
    const companyEmail = companySettings?.email || 'farmacia@daalef.com';
    
    const receiptText = `
        ${companyName}

        RUC: ${companyRuc}
Dirección: ${companyAddress}
Teléfono: ${companyPhone}
Email: ${companyEmail}

        FACTURA DE VENTA
        N°: ${sale.sale_number}

Fecha y Hora: ${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}
Cajero: ${companyName}
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
${sale.payment_method === 'cash' && sale.cash_received ? `Efectivo Recibido:              ${sale.cash_received.toFixed(2)}` : ''}
${sale.payment_method === 'cash' && sale.change_amount ? `Cambio:                         ${sale.change_amount.toFixed(2)}` : ''}

        Gracias por su compra
        ${companyName}
        
Su comprobante electrónico ha sido generado correctamente.
Recuerde también puede consultar su comprobante en el portal del SRI.
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
            <CardContent className="p-4">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold">FARMACIA DAALEF</h2>
                <p className="text-sm mt-2">Ticket de Venta</p>
                <p className="text-sm font-medium">N°: {sale.sale_number}</p>
              </div>

            <Separator className="mb-3" />

            {/* Sale Info */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span>Fecha:</span>
                <span>{format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cliente:</span>
                <span>{client?.name || 'CONSUMIDOR FINAL'}</span>
              </div>
            </div>

            <Separator className="mb-3" />

            {/* Products */}
            <div className="space-y-1 mb-3">
              <p className="text-sm font-medium">PRODUCTOS</p>
              <Separator />
              {sale.items?.map((item, index) => (
                <div key={index} className="text-sm">
                  <div>{item.product_name}</div>
                  <div className="flex justify-between">
                    <span>{item.quantity} x ${item.unit_price.toFixed(2)}</span>
                    <span>${item.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="mb-3" />

            {/* Totals */}
            <div className="space-y-1 mb-3">
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-${sale.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL:</span>
                <span>${sale.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="mb-3" />

            {/* Payment Method */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span>Pago:</span>
                <span>{getPaymentMethodLabel(sale.payment_method || '')}</span>
              </div>
              {sale.payment_method === 'cash' && sale.change_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Cambio:</span>
                  <span>${(sale.change_amount || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="mb-3" />

            {/* Footer */}
            <div className="text-center text-sm">
              <p>¡Gracias por su compra!</p>
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

// Print styles - only inject once
const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }
  
  .receipt-print {
    width: 300px;
    margin: 0;
    box-shadow: none;
    border: none;
    font-family: monospace;
  }
  
  .receipt-print * {
    font-size: 12px !important;
    line-height: 1.3 !important;
  }
  
  .receipt-print h2 {
    font-size: 14px !important;
    font-weight: bold !important;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  @page {
    margin: 5mm;
    size: auto;
  }
}
`;

// Inject print styles only once
if (typeof document !== 'undefined' && !document.getElementById('receipt-print-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'receipt-print-styles';
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}