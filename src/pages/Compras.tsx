import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Package, Truck, DollarSign, CheckCircle } from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { PurchaseOrderForm } from '@/components/purchases/PurchaseOrderForm';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function Compras() {
  const { orders, loading, error, markOrderAsReceived } = usePurchaseOrders();
  const [receivingOrder, setReceivingOrder] = useState<string | null>(null);

  const handleReceiveOrder = async (orderId: string) => {
    setReceivingOrder(orderId);
    try {
      const result = await markOrderAsReceived();
      if (result.success) {
        toast.success('Orden recibida correctamente. El inventario ha sido actualizado.');
      } else {
        toast.error(result.error || 'Error al recibir la orden');
      }
    } catch (error) {
      toast.error('Error inesperado al recibir la orden');
    } finally {
      setReceivingOrder(null);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTotal = orders
    .filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      approved: { label: 'Aprobada', variant: 'default' as const },
      received: { label: 'Recibida', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">
            Gestiona órdenes de compra y proveedores
          </p>
        </div>
        <PurchaseOrderForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes Pendientes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders.length === 1 ? 'orden pendiente' : 'órdenes pendientes'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Órdenes
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.length === 1 ? 'orden registrada' : 'órdenes registradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proveedores Activos
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(orders.map(order => order.supplier_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              proveedores únicos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra</CardTitle>
          <CardDescription>
            Lista de todas las órdenes de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Cargando órdenes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-red-600">Error al cargar</h3>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay órdenes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comienza creando tu primera orden de compra.
              </p>
              <div className="mt-4">
                <PurchaseOrderForm />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{order.order_number}</h4>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Proveedor: {order.supplier_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fecha: {new Date(order.order_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                      {order.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleReceiveOrder(order.id)}
                          disabled={receivingOrder === order.id}
                          className="ml-2"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {receivingOrder === order.id ? 'Recibiendo...' : 'Recibir'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}