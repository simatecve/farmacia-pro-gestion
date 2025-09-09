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
    if (printSettings?.auto_print) {
      // Auto print logic would go here
      console.log('Auto printing...');
    }
    window.print();
  };

  const handleDownload = () => {
    const companyName = companySettings?.name || 'DAALEF FARMACIA';
    const companyAddress = companySettings?.address || 'Av. Principal 123, Centro Comercial Plaza, Local 45';
    const companyPhone = companySettings?.phone || '+593 2 123-4567';
    const companyTaxId = companySettings?.tax_id || '1234567890001';
    const footerText = printSettings?.footer_text || 'Gracias por confiar en nosotros para su salud y bienestar';
    
    // Create a simple text receipt
    const receiptText = `
${companyName.toUpperCase()}
${companyAddress}
Tel: ${companyPhone}
${companySettings?.tax_id ? `RFC: ${companyTaxId}` : ''}

FACTURA: ${sale.sale_number}
FECHA: ${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm")}
CAJERO: Sistema
CLIENTE: ${client?.name || 'CONSUMIDOR FINAL'}

PRODUCTO                 CANT    PRECIO    TOTAL
${sale.items?.map(item => 
  `${item.product_name?.padEnd(20)}  ${item.quantity.toString().padStart(4)}  ${companySettings?.currency_symbol || '$'}${item.unit_price.toFixed(2).padStart(8)}  ${companySettings?.currency_symbol || '$'}${item.total_price.toFixed(2).padStart(8)}`
).join('\n') || ''}

SUBTOTAL:                           ${companySettings?.currency_symbol || '$'}${(sale.total_amount - sale.tax_amount).toFixed(2)}
${taxName} (${(taxRate * 100).toFixed(0)}%):                          ${companySettings?.currency_symbol || '$'}${sale.tax_amount.toFixed(2)}
TOTAL:                              ${companySettings?.currency_symbol || '$'}${sale.total_amount.toFixed(2)}

MÉTODO DE PAGO: ${sale.payment_method === 'cash' ? 'EFECTIVO' : 
                  sale.payment_method === 'card' ? 'TARJETA' : 'TRANSFERENCIA'}

${footerText}

¡Gracias por su compra!
Conserve este recibo

Sistema: ${companyName}
    `;

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
        <DialogHeader>
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
                <h2 className="text-xl font-bold">{companySettings?.name || 'Daalef Farmacia'}</h2>
                {companySettings?.address && (
                  <p className="text-sm text-muted-foreground">{companySettings.address}</p>
                )}
                {companySettings?.phone && (
                  <p className="text-sm text-muted-foreground">Tel: {companySettings.phone}</p>
                )}
                {companySettings?.tax_id && (
                  <p className="text-sm text-muted-foreground">RFC: {companySettings.tax_id}</p>
                )}
              </div>

            <Separator className="mb-4" />

            {/* Sale Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">FACTURA:</span>
                <span>{sale.sale_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">FECHA:</span>
                <span>{format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">CAJERO:</span>
                <span>Sistema</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">CLIENTE:</span>
                <span>{client?.name || 'CONSUMIDOR FINAL'}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Products */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium">
                <div className="col-span-6">PRODUCTO</div>
                <div className="col-span-2 text-center">CANT</div>
                <div className="col-span-2 text-right">PRECIO</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>
              <Separator />
              {sale.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 text-sm">
                  <div className="col-span-6 text-xs">{item.product_name}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">${item.unit_price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${item.total_price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>SUBTOTAL:</span>
                <span>${(sale.total_amount - sale.tax_amount).toFixed(2)}</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>DESCUENTOS:</span>
                  <span>-${sale.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{taxName} ({(taxRate * 100).toFixed(0)}%):</span>
                <span>{companySettings?.currency_symbol || '$'}{sale.tax_amount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>{companySettings?.currency_symbol || '$'}{sale.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Payment Method */}
            <div className="text-center mb-4">
              <p className="text-sm">
                <span className="font-medium">MÉTODO DE PAGO: </span>
                {getPaymentMethodLabel(sale.payment_method || '')}
              </p>
            </div>

            <Separator className="mb-4" />

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>{printSettings?.footer_text || 'Gracias por confiar en nosotros para su salud y bienestar'}</p>
              <p className="font-medium">¡Gracias por su compra!</p>
              <p>Conserve este recibo</p>
              <div className="mt-4 pt-2 border-t">
                <p>Sistema: {companySettings?.name || 'Daalef Farmacia'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
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
}
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}