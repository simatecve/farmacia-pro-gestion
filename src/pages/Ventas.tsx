import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  
  const { sales, loading } = useSales();

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

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
      default: return method;
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed').length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-accent rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-accent rounded mb-6"></div>
          <div className="h-64 bg-accent rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Ventas</h1>
        <p className="text-muted-foreground">Administra y visualiza todas las ventas realizadas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-12 w-12 text-primary" />
              <div>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total en Ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-12 w-12 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
                <p className="text-sm text-muted-foreground">Total de Ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="h-12 w-12 text-primary" />
              <div>
                <p className="text-2xl font-bold">{completedSales}</p>
                <p className="text-sm text-muted-foreground">Ventas Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-12 w-12 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{sales.filter(sale => sale.client_id).length}</p>
                <p className="text-sm text-muted-foreground">Ventas con Cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de venta o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron ventas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                    <TableCell>
                      {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>${sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(sale.status)}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.payment_method ? getPaymentMethodLabel(sale.payment_method) : 'N/A'}
                    </TableCell>
                    <TableCell>
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles de Venta - {sale.sale_number}</DialogTitle>
                          </DialogHeader>
                          {selectedSale && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Fecha:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(selectedSale.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Estado:</p>
                                  <Badge variant={getStatusColor(selectedSale.status)}>
                                    {getStatusLabel(selectedSale.status)}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Método de Pago:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedSale.payment_method ? getPaymentMethodLabel(selectedSale.payment_method) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Total:</p>
                                  <p className="text-lg font-bold">${selectedSale.total_amount.toFixed(2)}</p>
                                </div>
                              </div>

                              {selectedSale.items && selectedSale.items.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Productos:</h4>
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
                                      {selectedSale.items.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.product_name || 'Producto'}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                                          <TableCell>${item.total_price.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}

                              {selectedSale.notes && (
                                <div>
                                  <p className="text-sm font-medium">Notas:</p>
                                  <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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