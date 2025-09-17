import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, Download, X } from "lucide-react";
import { Sale, SaleItem } from "@/hooks/useSales";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect } from "react";
import { printerService } from "@/services/printerService";
import logoImage from "@/assets/logo-talpharma.png.png";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  client?: { name: string; identification_number?: string; phone?: string; address?: string; };
}

export function ReceiptModal({ isOpen, onClose, sale, client }: ReceiptModalProps) {
  const { companySettings, taxSettings, printSettings } = useSettings();
  const { user } = useAuth();
  
  if (!sale) return null;

  // Get default tax or first available tax setting
  const defaultTax = taxSettings.find(tax => tax.is_default) || taxSettings[0];
  const taxRate = defaultTax ? defaultTax.rate : 0.16;
  const taxName = defaultTax ? defaultTax.name : 'IVA';

  // Get current user info for cashier
  const cashierName = user?.profile?.full_name || user?.email || 'Sistema';

  const handlePrint = async () => {
    try {
      const printData = {
        companyName: companySettings?.company_name || companySettings?.name || 'DAALEF FARMA',
        companyRuc: companySettings?.tax_id || '1709738635001',
        address: companySettings?.address || 'PICHINCHA / QUITO / LA MAGDALENA / OE 7B OE7-42',
        phone: companySettings?.phone || '0987654321',
        email: companySettings?.email || 'farmacia@daalef.com',
        ticketNumber: sale.sale_number,
        date: format(new Date(sale.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es }),
        cashier: cashierName,
        client: client?.name || 'CONSUMIDOR FINAL',
        items: sale.items?.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          total: item.total_price
        })) || [],
        subtotal: sale.total_amount - sale.tax_amount,
        tax: sale.tax_amount,
        discount: sale.discount_amount || 0,
        total: sale.total_amount,
        paymentMethod: getPaymentMethodLabel(sale.payment_method || ''),
        cashReceived: sale.cash_received || sale.total_amount,
        change: sale.change_amount || 0,
        footerText: printSettings?.footer_text || '¡Gracias por su compra!\nVuelva pronto',
        includeLogo: printSettings?.print_logo || false,
        paperWidth: printSettings?.paper_width || 80
      };

      const success = await printerService.printReceipt(JSON.stringify(printData));
      
      if (!success) {
        // Fallback to browser print
        window.print();
      }
    } catch (error) {
      console.error('Error printing:', error);
      // Fallback to browser print
      window.print();
    }
  };

  const generateReceiptText = () => {
    const companyName = companySettings?.company_name || companySettings?.name || 'DAALEF FARMA';
    const companyRuc = companySettings?.tax_id || '1709738635001';
    const companyAddress = companySettings?.address || 'PICHINCHA / QUITO / LA MAGDALENA / OE 7B OE7-42';
    const companyPhone = companySettings?.phone || '0987654321';
    const companyEmail = companySettings?.email || 'farmacia@daalef.com';
    
    const receiptText = `
        ${companyName}
        www.daalef.com

        RUC: ${companyRuc}
Dirección: ${companyAddress}
Teléfono: ${companyPhone}
Email: ${companyEmail}

        FACTURA DE VENTA
        N°: ${sale.sale_number}

Fecha y Hora: ${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}
Cajero: ${cashierName}
Cliente: ${client?.name || 'CONSUMIDOR FINAL'}
${client?.identification_number ? `Cédula: ${client.identification_number}` : ''}
${client?.phone ? `Teléfono: ${client.phone}` : ''}
${client?.address ? `Dirección: ${client.address}` : ''}

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

        ¡Gracias por su compra!
        Vuelva pronto
        
        DAALEF FARMA
        www.daalef.com
        
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
          <Card className={`receipt-print receipt-print-${printSettings?.paper_width || 80}`}>
            <CardContent className="p-6">
              {/* Header - Company Info */}
              <div className="text-center mb-6">
                {printSettings?.print_logo && (
                  <div className="flex justify-center mb-3">
                    <img 
                      src={logoImage} 
                      alt="Logo" 
                      className="h-16 w-auto object-contain print:h-12"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold text-blue-600">{companySettings?.company_name || companySettings?.name || 'DAALEF FARMA'}</h2>
                <p className="text-sm font-medium text-blue-500 mb-2">www.daalef.com</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p><strong>RUC:</strong> {companySettings?.tax_id || '1709738635001'}</p>
                  <p><strong>Dirección:</strong> {companySettings?.address || 'PICHINCHA / QUITO / LA MAGDALENA / OE 7B OE7-42'}</p>
                  <p><strong>Teléfono:</strong> {companySettings?.phone || '0987654321'}</p>
                  <p><strong>Email:</strong> {companySettings?.email || 'farmacia@daalef.com'}</p>
                </div>
                <div className="mt-4 p-2 bg-gray-50 rounded">
                  <h3 className="font-bold text-lg">FACTURA DE VENTA</h3>
                  <p className="text-sm font-medium">N°: {sale.sale_number}</p>
                </div>
              </div>

            <Separator className="mb-4" />

            {/* Sale Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fecha y Hora:</span>
                <span>{format(new Date(sale.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Cajero:</span>
                <span>{cashierName}</span>
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
              {client?.phone && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Teléfono:</span>
                  <span>{client.phone}</span>
                </div>
              )}
              {client?.address && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Dirección:</span>
                  <span className="text-xs">{client.address}</span>
                </div>
              )}
            </div>

            <Separator className="mb-4" />

            {/* Products */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-medium bg-gray-50 p-2 rounded">
                <div className="col-span-1">CANT</div>
                <div className="col-span-1">PRODUCTO</div>
                <div className="col-span-1 text-right">PRECIO</div>
                <div className="col-span-1 text-right">TOTAL</div>
              </div>
              {sale.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 text-sm py-1 border-b border-gray-100">
                  <div className="col-span-1 font-medium">{item.quantity}</div>
                  <div className="col-span-1 text-xs">{item.product_name}</div>
                  <div className="col-span-1 text-right">${item.unit_price.toFixed(2)}</div>
                  <div className="col-span-1 text-right font-medium">${item.total_price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Totals */}
            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>Subtotal 0%:</span>
                <span>${(sale.total_amount - sale.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal 15%:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{taxName} {(taxRate * 100).toFixed(0)}%:</span>
                <span>${sale.tax_amount.toFixed(2)}</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span>-${sale.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>${sale.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Payment Method */}
            <div className="space-y-2 mb-4 p-3 bg-blue-50 rounded">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Forma de Pago:</span>
                <span className="font-bold">{getPaymentMethodLabel(sale.payment_method || '')}</span>
              </div>
              {sale.payment_method === 'cash' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Efectivo Recibido:</span>
                    <span className="font-bold">${((sale as any).cash_received || sale.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Cambio:</span>
                    <span className="font-bold text-green-600">${((sale as any).change_amount || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <Separator className="mb-4" />

            {/* Footer */}
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-green-600 mb-2">
                ¡Gracias por su compra!
              </div>
              <p className="text-sm text-gray-600">Vuelva pronto</p>
              
              <div className="mt-4 p-3 bg-blue-600 text-white rounded">
                <p className="font-bold text-lg">DAALEF FARMA</p>
                <p className="text-sm">www.daalef.com</p>
              </div>
              
              <div className="text-xs text-gray-500 mt-3 space-y-1">
                {printSettings?.footer_text ? (
                  <div className="whitespace-pre-line">{printSettings.footer_text}</div>
                ) : (
                  <>
                    <p>Su comprobante electrónico ha sido generado correctamente.</p>
                    <p>Recuerde también puede consultar su comprobante en el portal del SRI.</p>
                  </>
                )}
                <p className="mt-2">Sistema de Gestión Farmacéutica</p>
                <p>© 2024 - Todos los derechos reservados</p>
              </div>
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
    width: 80mm;
    max-width: 80mm;
    margin: 0;
    box-shadow: none;
    border: none;
    font-family: 'Courier New', 'Consolas', monospace;
    font-size: 11px;
    line-height: 1.2;
    color: #000 !important;
    background: #fff !important;
  }
  
  .receipt-print-58 { width: 58mm; max-width: 58mm; }
  .receipt-print-80 { width: 80mm; max-width: 80mm; }
  .receipt-print-112 { width: 112mm; max-width: 112mm; }
  
  .receipt-print * {
    font-size: 11px !important;
    line-height: 1.2 !important;
    color: #000 !important;
  }
  
  .receipt-print h2 {
    font-size: 14px !important;
    font-weight: bold !important;
    margin: 2px 0 !important;
  }
  
  .receipt-print h3 {
    font-size: 12px !important;
    font-weight: bold !important;
    margin: 2px 0 !important;
  }
  
  .receipt-print img {
    max-width: 60px !important;
    height: auto !important;
    margin: 0 auto 5px !important;
    display: block !important;
  }
  
  .receipt-print .text-xl { font-size: 14px !important; }
  .receipt-print .text-lg { font-size: 12px !important; }
  .receipt-print .text-sm { font-size: 10px !important; }
  .receipt-print .text-xs { font-size: 9px !important; }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Courier New', 'Consolas', monospace;
  }
  
  @page {
    margin: 3mm;
    size: 80mm auto;
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