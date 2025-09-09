import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Eye, RotateCcw } from "lucide-react";
import { useRefunds, Refund } from "@/hooks/useRefunds";

export function RefundsList() {
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const { refunds, loading, approveRefund, rejectRefund } = useRefunds();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      case 'transfer':
        return 'Transferencia';
      case 'store_credit':
        return 'Crédito en Tienda';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando devoluciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Devoluciones</CardTitle>
      </CardHeader>
      <CardContent>
        {refunds.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hay devoluciones registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell>
                    {new Date(refund.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    Venta #{refund.sale_id.slice(-8)}
                  </TableCell>
                  <TableCell>${refund.refund_amount.toFixed(2)}</TableCell>
                  <TableCell>{getRefundMethodLabel(refund.refund_method)}</TableCell>
                  <TableCell>{getStatusBadge(refund.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRefund(refund)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles de Devolución</DialogTitle>
                          </DialogHeader>
                          {selectedRefund && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Fecha</p>
                                  <p className="font-medium">
                                    {new Date(selectedRefund.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Estado</p>
                                  {getStatusBadge(selectedRefund.status)}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Monto</p>
                                  <p className="font-medium">${selectedRefund.refund_amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Método</p>
                                  <p className="font-medium">
                                    {getRefundMethodLabel(selectedRefund.refund_method)}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Motivo</p>
                                <p className="bg-muted p-3 rounded">{selectedRefund.refund_reason}</p>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Productos Devueltos</p>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Producto</TableHead>
                                      <TableHead>Cantidad</TableHead>
                                      <TableHead>Precio Unit.</TableHead>
                                      <TableHead>Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedRefund.items_refunded.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {refund.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveRefund(refund.id)}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectRefund(refund.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}