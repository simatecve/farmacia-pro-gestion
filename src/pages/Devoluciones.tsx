import { RefundForm } from "@/components/refunds/RefundForm";
import { RefundsList } from "@/components/refunds/RefundsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { useRefunds } from "@/hooks/useRefunds";

export default function Devoluciones() {
  const { refunds } = useRefunds();

  const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
  const approvedRefunds = refunds.filter(r => r.status === 'approved').length;
  const totalRefundAmount = refunds
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.refund_amount, 0);

  const stats = [
    {
      title: "Devoluciones Pendientes",
      value: pendingRefunds,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Devoluciones Aprobadas",
      value: approvedRefunds,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Total Devuelto",
      value: `$${totalRefundAmount.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Total Devoluciones",
      value: refunds.length,
      icon: RotateCcw,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Devoluciones</h1>
          <p className="text-muted-foreground">
            Gestiona las devoluciones de productos y ventas
          </p>
        </div>
        <RefundForm />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Refunds List */}
      <RefundsList />
    </div>
  );
}