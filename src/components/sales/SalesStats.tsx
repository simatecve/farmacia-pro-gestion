import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Users, CreditCard, Calendar } from "lucide-react";
import { Sale } from "@/hooks/useSales";

interface SalesStatsProps {
  sales: Sale[];
  filteredSales: Sale[];
}

export function SalesStats({ sales, filteredSales }: SalesStatsProps) {
  // Calculate stats for filtered sales
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed').length;
  const salesWithClients = filteredSales.filter(sale => sale.client_id).length;
  const totalItems = filteredSales.reduce((sum, sale) => sum + (sale.items?.length || 0), 0);

  // Calculate payment method breakdown
  const paymentMethodStats = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + sale.total_amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average sale
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  const stats = [
    {
      title: "Total en Ventas",
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${filteredSales.length} ventas`
    },
    {
      title: "Ventas Completadas",
      value: completedSales.toString(),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: `${filteredSales.length > 0 ? ((completedSales / filteredSales.length) * 100).toFixed(1) : 0}% del total`
    },
    {
      title: "Productos Vendidos",
      value: totalItems.toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total de items"
    },
    {
      title: "Ventas con Cliente",
      value: salesWithClients.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: `${filteredSales.length > 0 ? ((salesWithClients / filteredSales.length) * 100).toFixed(1) : 0}% del total`
    },
    {
      title: "Venta Promedio",
      value: `$${averageSale.toFixed(2)}`,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Por transacción"
    },
    {
      title: "Método Principal",
      value: Object.keys(paymentMethodStats).length > 0 
        ? Object.entries(paymentMethodStats).reduce((a, b) => paymentMethodStats[a[0]] > paymentMethodStats[b[0]] ? a : b)[0]
        : 'N/A',
      icon: CreditCard,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      description: Object.keys(paymentMethodStats).length > 0 
        ? `$${Math.max(...Object.values(paymentMethodStats)).toFixed(2)}`
        : "Sin datos"
    }
  ];

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.title === "Método Principal" ? getPaymentMethodLabel(stat.value) : stat.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(paymentMethodStats).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Método de Pago</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethodStats)
                .sort(([,a], [,b]) => b - a)
                .map(([method, amount]) => {
                  const percentage = (amount / totalSales) * 100;
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="font-medium">{getPaymentMethodLabel(method)}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}