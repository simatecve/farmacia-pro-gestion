import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Printer, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sale } from "@/hooks/useSales";
import Logo from "@/assets/logo-talpharma.png.png";

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
    // Create print content with PDF-like styling
    const printContent = `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <!-- Header with Logo -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <svg width="80" height="32" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="80" rx="8" fill="#dc2626"/>
              <g transform="translate(20, 20)">
                <rect x="12" y="5" width="6" height="30" fill="white" rx="3"/>
                <rect x="5" y="12" width="20" height="6" fill="white" rx="3"/>
              </g>
              <g transform="translate(55, 25)" stroke="white" stroke-width="2" fill="none">
                <path d="M2 8 C2 4, 6 4, 6 8 L6 15 C6 20, 10 24, 15 24 C20 24, 24 20, 24 15 L24 8 C24 4, 28 4, 28 8"/>
                <circle cx="15" cy="28" r="4" fill="white"/>
                <circle cx="2" cy="8" r="2" fill="white"/>
                <circle cx="28" cy="8" r="2" fill="white"/>
              </g>
              <text x="95" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">FARMACIAS</text>
              <text x="95" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">talPharma</text>
            </svg>
            <div>
              <h1 style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 0;">FARMACIAS talPharma</h1>
              <p style="color: #666; font-size: 14px; margin: 0;">Tu salud es nuestra prioridad</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">FACTURA DE VENTA</p>
            <p style="color: #666; font-size: 14px; margin: 0;">No. ${sale.sale_number}</p>
          </div>
        </div>

        <!-- Sale Information -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
          <div>
            <h3 style="font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">INFORMACIÓN DE VENTA</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Fecha:</span>
              <span>${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Estado:</span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: ${sale.status === 'completed' ? '#dcfce7' : sale.status === 'pending' ? '#fef3c7' : '#fee2e2'}; color: ${sale.status === 'completed' ? '#166534' : sale.status === 'pending' ? '#92400e' : '#991b1b'};">
                ${getStatusLabel(sale.status)}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 500;">Método de Pago:</span>
              <span>${getPaymentMethodLabel(sale.payment_method || '')}</span>
            </div>
          </div>
          
          <div>
            <h3 style="font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">INFORMACIÓN DEL CLIENTE</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Cliente:</span>
              <span>${sale.client_name || 'CONSUMIDOR FINAL'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 500;">ID Cliente:</span>
              <span>${sale.client_id || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        ${sale.items && sale.items.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">DETALLE DE PRODUCTOS</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
              <thead style="background-color: #f9fafb;">
                <tr>
                  <th style="padding: 12px; text-align: left; font-weight: 500; color: #374151; border-bottom: 1px solid #ccc;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-weight: 500; color: #374151; border-bottom: 1px solid #ccc;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; color: #374151; border-bottom: 1px solid #ccc;">P. Unit.</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; color: #374151; border-bottom: 1px solid #ccc;">Descuento</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; color: #374151; border-bottom: 1px solid #ccc;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map((item: any, index: number) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                    <td style="padding: 12px; border-bottom: 1px solid #ccc;">${item.product_name || 'Producto'}</td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #ccc;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ccc;">$${item.unit_price.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ccc;">$${(item.discount_amount || 0).toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ccc; font-weight: 500;">$${item.total_price.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 320px; border-top: 2px solid #ccc; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Subtotal:</span>
              <span>$${(sale.total_amount - sale.tax_amount).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Descuento:</span>
              <span>$${sale.discount_amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Impuestos:</span>
              <span>$${sale.tax_amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 1px solid #ccc; padding-top: 8px;">
              <span>TOTAL:</span>
              <span style="color: #dc2626;">$${sale.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${sale.notes ? `
          <div style="border-top: 1px solid #ccc; padding-top: 15px; margin-bottom: 30px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 10px;">OBSERVACIONES</h3>
            <p style="color: #374151; background-color: #f9fafb; padding: 12px; border-radius: 4px; margin: 0;">${sale.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: center; border-top: 2px solid #dc2626; padding-top: 15px;">
          <p style="font-size: 18px; font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">¡Gracias por su compra!</p>
          <p style="color: #666; font-size: 14px; margin: 0 0 4px 0;">Farmacia talPharma - Su salud es nuestra prioridad</p>
          <p style="color: #999; font-size: 12px; margin: 0;">Documento generado el ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Factura - ${sale.sale_number}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
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
            <TableHead>Cliente</TableHead>
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
                <TableCell className="font-medium">{sale.client_name || 'CONSUMIDOR FINAL'}</TableCell>
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
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="sr-only">
                          <DialogTitle>Detalles de Venta</DialogTitle>
                        </DialogHeader>
                        {selectedSale && (
                          <div className="bg-white p-8 space-y-6" style={{ fontFamily: 'Arial, sans-serif' }}>
                            {/* Header with Logo */}
                            <div className="flex items-center justify-between border-b-2 border-red-600 pb-4">
                              <div className="flex items-center gap-4">
                                <img src={Logo} alt="Farmacia Logo" className="h-16 w-auto" />
                                <div>
                                  {/* Texto eliminado - solo queda el logo */}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">FACTURA DE VENTA</p>
                                <p className="text-sm text-gray-600">No. {selectedSale.sale_number}</p>
                              </div>
                            </div>

                            {/* Sale Information */}
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <h3 className="font-bold text-lg border-b border-gray-300 pb-1">INFORMACIÓN DE VENTA</h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Fecha:</span>
                                    <span>{format(new Date(selectedSale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Estado:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      selectedSale.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      selectedSale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {getStatusLabel(selectedSale.status)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Método de Pago:</span>
                                    <span>{getPaymentMethodLabel(selectedSale.payment_method || '')}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h3 className="font-bold text-lg border-b border-gray-300 pb-1">INFORMACIÓN DEL CLIENTE</h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Cliente:</span>
                                    <span>{selectedSale.client_name || 'CONSUMIDOR FINAL'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">ID Cliente:</span>
                                    <span>{selectedSale.client_id || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Products Table */}
                            {selectedSale.items && selectedSale.items.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="font-bold text-lg border-b border-gray-300 pb-1">DETALLE DE PRODUCTOS</h3>
                                <div className="border border-gray-300 rounded">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Producto</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-700 border-b">Cant.</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">P. Unit.</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Descuento</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedSale.items.map((item: any, index: number) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-4 py-3 border-b">{item.product_name || 'Producto'}</td>
                                          <td className="px-4 py-3 text-center border-b">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right border-b">${item.unit_price.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right border-b">${(item.discount_amount || 0).toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right border-b font-medium">${item.total_price.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Totals */}
                            <div className="flex justify-end">
                              <div className="w-80 space-y-2 border-t-2 border-gray-300 pt-4">
                                <div className="flex justify-between">
                                  <span className="font-medium">Subtotal:</span>
                                  <span>${(selectedSale.total_amount - selectedSale.tax_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Descuento:</span>
                                  <span>${selectedSale.discount_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Impuestos:</span>
                                  <span>${selectedSale.tax_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-2">
                                  <span>TOTAL:</span>
                                  <span className="text-red-600">${selectedSale.total_amount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            {selectedSale.notes && (
                              <div className="space-y-2 border-t border-gray-300 pt-4">
                                <h3 className="font-bold text-lg">OBSERVACIONES</h3>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedSale.notes}</p>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="text-center border-t-2 border-red-600 pt-4 space-y-2">
                              <p className="text-lg font-bold text-red-600">¡Gracias por su compra!</p>
                              <p className="text-sm text-gray-600">Farmacia talPharma - Su salud es nuestra prioridad</p>
                              <p className="text-xs text-gray-500">Documento generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                            </div>
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