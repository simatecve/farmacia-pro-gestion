import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function RecentSales() {
  const { data, loading, refresh } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle>Ventas Recientes</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Últimas ventas realizadas hoy
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.sales.recent.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay ventas recientes hoy</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href="/pos">Realizar venta</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.sales.recent.map((sale, index) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">#{sale.sale_number}</p>
                    <Badge variant="outline" className="text-xs">
                      {sale.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(sale.created_at), 'HH:mm', { locale: es })}
                    </span>
                    <span>
                      {sale.sale_items?.length || 0} productos
                    </span>
                    {sale.payment_method && (
                      <span className="capitalize">
                        {sale.payment_method}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      ${parseFloat(sale.total_amount || '0').toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    {sale.discount_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Desc: ${parseFloat(sale.discount_amount || '0').toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/ventas?sale=${sale.id}`}>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="/ventas">Ver todas las ventas</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}