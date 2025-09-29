import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { format } from "date-fns";

interface QuotePDFProps {
  open: boolean;
  onClose: () => void;
  quote: {
    quote_number: string;
    client_name?: string;
    created_at: string;
    valid_until?: string;
    notes?: string;
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
  };
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const QuotePDF = ({ open, onClose, quote, companyInfo }: QuotePDFProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Presupuesto {quote.quote_number}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="quote-content" className="bg-white p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">{companyInfo?.name || "Mi Empresa"}</h1>
              {companyInfo?.address && <p className="text-sm">{companyInfo.address}</p>}
              {companyInfo?.phone && <p className="text-sm">Tel: {companyInfo.phone}</p>}
              {companyInfo?.email && <p className="text-sm">Email: {companyInfo.email}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">PRESUPUESTO</h2>
              <p className="text-sm">No. {quote.quote_number}</p>
              <p className="text-sm">Fecha: {format(new Date(quote.created_at), "dd/MM/yyyy")}</p>
              {quote.valid_until && (
                <p className="text-sm">Válido hasta: {format(new Date(quote.valid_until), "dd/MM/yyyy")}</p>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Cliente:</h3>
            <p>{quote.client_name || "CONSUMIDOR FINAL"}</p>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-right py-2">Cantidad</th>
                  <th className="text-right py-2">Precio Unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.product_name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">${item.unit_price.toFixed(2)}</td>
                    <td className="text-right">${item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuesto:</span>
                <span>${quote.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>TOTAL:</span>
                <span>${quote.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Observaciones:</h3>
              <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Gracias por su preferencia</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
