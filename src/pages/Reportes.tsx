import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download, TrendingUp, DollarSign, Package, Users, BarChart3 } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export default function Reportes() {
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { getSalesByDateRange } = useSales();

  useEffect(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case "today":
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case "week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default:
        return;
    }

    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  }, [dateRange]);

  const generateReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const sales = await getSalesByDateRange(
        `${startDate}T00:00:00.000Z`,
        `${endDate}T23:59:59.999Z`
      );
      setReportData(sales);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      generateReport();
    }
  }, [startDate, endDate]);

  const calculateStats = () => {
    const totalSales = reportData.length;
    const totalRevenue = reportData.reduce((sum, sale) => sum + sale.total_amount, 0);
    const completedSales = reportData.filter(sale => sale.status === 'completed').length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const productsSold = reportData.reduce((sum, sale) => {
      return sum + (sale.sale_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0);
    }, 0);

    const uniqueClients = new Set(reportData.filter(sale => sale.client_id).map(sale => sale.client_id)).size;

    return {
      totalSales,
      totalRevenue,
      completedSales,
      averageSale,
      productsSold,
      uniqueClients
    };
  };

  const stats = calculateStats();

  const getPaymentMethodStats = () => {
    const methods = reportData.reduce((acc, sale) => {
      if (sale.payment_method) {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methods).map(([method, amount]) => ({
      method,
      amount,
      label: method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : method === 'transfer' ? 'Transferencia' : method
    }));
  };

  const getTopProducts = () => {
    const products = reportData.reduce((acc, sale) => {
      sale.sale_items?.forEach((item: any) => {
        const productName = item.products?.name || 'Producto desconocido';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += item.total_price;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    return Object.entries(products)
      .map(([name, data]: [string, any]) => ({ 
        name, 
        quantity: data.quantity as number, 
        revenue: data.revenue as number 
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const paymentStats = getPaymentMethodStats();
  const topProducts = getTopProducts();

  const exportReport = () => {
    const csvContent = [
      ['Número de Venta', 'Fecha', 'Total', 'Estado', 'Método de Pago'],
      ...reportData.map(sale => [
        sale.sale_number,
        format(new Date(sale.created_at), "dd/MM/yyyy HH:mm"),
        sale.total_amount.toFixed(2),
        sale.status,
        sale.payment_method || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${startDate}_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes de Ventas</h1>
        <p className="text-muted-foreground">Análisis detallado del rendimiento de ventas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período Predefinido</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={generateReport} disabled={loading}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {loading ? "Generando..." : "Generar"}
                </Button>
                <Button variant="outline" onClick={exportReport} disabled={reportData.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-lg font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Ingresos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-lg font-bold">{stats.totalSales}</p>
                <p className="text-xs text-muted-foreground">Total Ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-lg font-bold">{stats.completedSales}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-lg font-bold">${stats.averageSale.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Venta Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-lg font-bold">{stats.productsSold}</p>
                <p className="text-xs text-muted-foreground">Productos Vendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-lg font-bold">{stats.uniqueClients}</p>
                <p className="text-xs text-muted-foreground">Clientes Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>{stat.label}</TableCell>
                    <TableCell className="text-right">${(stat.amount as number).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalRevenue > 0 ? (((stat.amount as number) / stats.totalRevenue) * 100).toFixed(1) : '0'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Sales Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método de Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay datos para el período seleccionado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                    <TableCell>
                      {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">${sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.status === 'completed' ? 'Completada' :
                         sale.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sale.payment_method === 'cash' ? 'Efectivo' :
                       sale.payment_method === 'card' ? 'Tarjeta' :
                       sale.payment_method === 'transfer' ? 'Transferencia' : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}