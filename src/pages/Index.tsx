import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data, loading, error, refresh } = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión farmacéutica
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última actualización</p>
            <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Ventas Hoy"
              value={`$${data.sales.today.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
              change={`${data.sales.todayChange >= 0 ? '+' : ''}${data.sales.todayChange.toFixed(1)}% vs ayer`}
              changeType={data.sales.todayChange >= 0 ? "positive" : "negative"}
              icon={DollarSign}
              iconColor="primary"
            />
            <StatsCard
              title="Productos en Stock"
              value={data.inventory.totalProducts.toString()}
              change={`${data.alerts.lowStock} productos bajo stock`}
              changeType={data.alerts.lowStock > 0 ? "warning" : "neutral"}
              icon={Package}
              iconColor="secondary"
            />
            <StatsCard
              title="Clientes Activos"
              value={data.clients.total.toString()}
              change={`+${data.clients.newThisWeek} nuevos esta semana`}
              changeType="positive"
              icon={Users}
              iconColor="success"
            />
            <StatsCard
              title="Alertas Pendientes"
              value={data.alerts.total.toString()}
              change={`${data.alerts.expiring} productos por vencer`}
              changeType={data.alerts.total > 0 ? "negative" : "neutral"}
              icon={AlertTriangle}
              iconColor="warning"
            />
          </>
        )}
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Ventas de los Últimos 7 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 bg-muted rounded-lg animate-pulse" />
            ) : (
              <div className="h-48 flex items-end gap-2 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4">
                {data.sales.week.map((value, index) => {
                  const maxValue = Math.max(...data.sales.week);
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        ${value.toFixed(0)}
                      </div>
                      <div 
                        className="w-full bg-primary rounded-t min-h-[8px] transition-all duration-300"
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <RecentSales />
        
        {/* Inventory Alerts */}
        <InventoryAlerts />
        
        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
};

export default Index;