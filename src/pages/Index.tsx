import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Clock,
  BarChart3
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido al sistema de gestión farmacéutica
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última actualización</p>
            <p className="text-sm font-medium">{new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ventas Hoy"
            value="$12,450"
            change="+12% vs ayer"
            changeType="positive"
            icon={DollarSign}
            iconColor="primary"
          />
          <StatsCard
            title="Productos en Stock"
            value="1,248"
            change="23 productos bajo stock"
            changeType="warning"
            icon={Package}
            iconColor="secondary"
          />
          <StatsCard
            title="Clientes Activos"
            value="342"
            change="+8 nuevos esta semana"
            changeType="positive"
            icon={Users}
            iconColor="success"
          />
          <StatsCard
            title="Alertas Pendientes"
            value="5"
            change="2 productos por vencer"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="warning"
          />
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart Placeholder */}
          <Card className="lg:col-span-2 hover-lift transition-smooth shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Ventas de la Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gradient-subtle rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Gráfico de ventas</p>
                  <p className="text-sm text-muted-foreground">Próximamente disponible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Inventory Alerts */}
          <Card className="hover-lift transition-smooth shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas de Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div>
                    <p className="font-medium text-sm">Ibuprofeno 400mg</p>
                    <p className="text-xs text-muted-foreground">Stock: 8 unidades</p>
                  </div>
                  <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded">
                    Stock Bajo
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-sm">Amoxicilina 500mg</p>
                    <p className="text-xs text-muted-foreground">Vence: 15/12/2024</p>
                  </div>
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    Por Vencer
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div>
                    <p className="font-medium text-sm">Acetaminofén 500mg</p>
                    <p className="text-xs text-muted-foreground">Stock: 15 unidades</p>
                  </div>
                  <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded">
                    Stock Bajo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
