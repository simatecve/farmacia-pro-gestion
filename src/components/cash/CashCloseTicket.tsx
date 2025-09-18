import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Printer, Receipt, Download } from 'lucide-react';
import { CashRegisterSession } from '@/hooks/useCashRegister';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CashCloseTicketProps {
  session: CashRegisterSession;
  onPrint?: () => void;
}

export function CashCloseTicket({ session, onPrint }: CashCloseTicketProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [printing, setPrinting] = useState(false);
  const { toast } = useToast();

  const expectedAmount = session.opening_amount + session.total_cash;
  const difference = session.closing_amount ? session.closing_amount - expectedAmount : 0;

  const ticketContent = `
        Cierre de Caja
        N°: ${session.id.slice(-6)}

    QUINGA SANCHEZ JOHN WILFRIDO

        RUC: 1709738635001
Dirección: PICHINCHA / QUITO / LA MAGDALENA / OE
                7B OE7-42

CAJA: ${session.register_name}
Responsable: QUINGA SANCHEZ JOHN WILFRIDO
Fecha Apertura: ${format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
Fecha Cierre: ${session.closed_at ? format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : 'Pendiente'}
N° Ventas Realizadas: ${(session as any).total_transactions || 0}
N° Ventas Anuladas: 0
Valor de Apertura: ${session.opening_amount.toFixed(2)}

Detalle de Ingresos:
================================================
Cant  F. Pago                          Total
================================================
6 EFECTIVO                         ${session.total_cash.toFixed(2)}
================================================

Detalle de Egresos:
================================================
Cant  F. Pago                          Total
================================================
================================================
                    (+)Total Ingresos:    ${session.total_cash.toFixed(2)}
                    (+)Total Apertura:    ${session.opening_amount.toFixed(2)}
                    (-)Total Egresos:     0,00
                (a)T. Efectivo Sistema:   ${expectedAmount.toFixed(2)}
                (b)T. Efectivo Contado:   ${(session.closing_amount || 0).toFixed(2)}

El valor del Dinero en EFECTIVO DEL SISTEMA (a)
NO es igual al valor del Dinero en EFECTIVO CONT
                    ADO (b)

                    FALTANTE: ${Math.abs(difference).toFixed(2)}


        QUINGA SANCHEZ JOHN WILFRIDO
  `;

  const handlePrint = async () => {
    setPrinting(true);
    try {
      // Crear elemento para imprimir
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Cierre de Caja - ${session.register_name}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 20px;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>${ticketContent}</body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Esperar un momento para que se cargue el contenido
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast({
        title: "Ticket enviado a impresión",
        description: "El ticket de cierre de caja se ha enviado a la impresora"
      });
      
      onPrint?.();
    } catch (error) {
      toast({
        title: "Error al imprimir",
        description: error instanceof Error ? error.message : "No se pudo imprimir el ticket",
        variant: "destructive"
      });
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-${session.register_name}-${format(new Date(session.opened_at), 'yyyy-MM-dd', { locale: es })}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Ticket descargado",
      description: "El ticket de cierre se ha descargado como archivo de texto"
    });
  };

  return (
    <div className="flex gap-2">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Receipt className="w-4 h-4" />
            Vista Previa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa - Ticket de Cierre</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded">
              {ticketContent}
            </pre>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
            <Button
              onClick={handlePrint}
              disabled={printing}
              size="sm"
              className="flex-1 gap-2"
            >
              <Printer className="w-4 h-4" />
              {printing ? 'Imprimiendo...' : 'Imprimir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button
        onClick={handlePrint}
        disabled={printing}
        size="sm"
        className="gap-2"
      >
        <Printer className="w-4 h-4" />
        {printing ? 'Imprimiendo...' : 'Imprimir Ticket'}
      </Button>
    </div>
  );
}