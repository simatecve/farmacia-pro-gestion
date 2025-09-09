import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function InventoryAlerts() {
  const { data, loading, refresh } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-3">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const allAlerts = [
    ...data.inventory.lowStock.map(product => ({
      ...product,
      type: 'low_stock' as const,
      message: 'Stock bajo',
      severity: 'warning' as const
    })),
    ...data.inventory.expiringSoon.map(product => ({
      ...product,
      type: 'expiring' as const,
      message: 'Por vencer',
      severity: 'error' as const
    }))
  ].slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Alertas de Inventario</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {data.alerts.total} alertas activas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay alertas de inventario</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.map((alert, index) => (
              <div
                key={`${alert.type}-${alert.id}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.severity === 'error' 
                    ? 'bg-destructive/5 border-destructive/20' 
                    : 'bg-warning/5 border-warning/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.type === 'low_stock' ? (
                      <Package className="h-4 w-4 text-warning" />
                    ) : (
                      <Calendar className="h-4 w-4 text-destructive" />
                    )}
                    <p className="font-medium text-sm">{alert.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.type === 'low_stock' 
                      ? `Stock: ${alert.inventory?.[0]?.current_stock || 0} unidades`
                      : `Vence: ${alert.expiry_date ? format(new Date(alert.expiry_date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={alert.severity === 'error' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.message}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/productos?search=${encodeURIComponent(alert.name)}`}>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            
            {data.alerts.total > 5 && (
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/inventario">
                    Ver todas las alertas ({data.alerts.total})
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}