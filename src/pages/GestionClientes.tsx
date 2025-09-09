import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Users, ShoppingCart, Star, Calendar, Bell, Activity } from "lucide-react";
import { useClients } from "@/hooks/useClients";

export default function GestionClientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const { clients, loading } = useClients();

  // Análisis de clientes
  const topClients = clients
    .sort((a, b) => b.total_purchases - a.total_purchases)
    .slice(0, 10);

  const vipClients = clients.filter(c => c.loyalty_points > 1000);
  const recentClients = clients
    .filter(c => {
      const createdDate = new Date(c.created_at);
      const daysAgo = parseInt(selectedPeriod);
      return createdDate >= new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    });

  const averagePurchase = clients.length > 0 
    ? clients.reduce((sum, c) => sum + c.total_purchases, 0) / clients.length 
    : 0;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Análisis completo y gestión de la base de clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              {clients.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary flex items-center gap-2">
              <Star className="w-5 h-5" />
              {vipClients.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compra Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ${averagePurchase.toFixed(0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {recentClients.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" className="gap-2">
            <Activity className="w-4 h-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="w-4 h-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Bell className="w-4 h-4" />
            Campañas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Clientes por Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.loyalty_points} puntos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${client.total_purchases.toLocaleString()}</div>
                        {client.last_purchase_date && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(client.last_purchase_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clientes VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vipClients.slice(0, 10).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-secondary" />
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${client.total_purchases.toLocaleString()} en compras
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" />
                        {client.loyalty_points}
                      </Badge>
                    </div>
                  ))}
                  {vipClients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay clientes VIP aún
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Compras por Cliente</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                      <SelectItem value="365">1 año</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total Compras</TableHead>
                    <TableHead>Puntos Fidelidad</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${client.total_purchases.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Star className="w-3 h-3" />
                          {client.loyalty_points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.last_purchase_date ? (
                          new Date(client.last_purchase_date).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Sin compras</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.loyalty_points > 1000 ? "default" : "secondary"}>
                          {client.loyalty_points > 1000 ? "VIP" : "Regular"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campañas de Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Recordatorios de Medicamentos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Envía recordatorios automáticos a clientes para renovar sus medicamentos
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Promociones VIP</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ofertas especiales para clientes con más de 1000 puntos
                    </p>
                    <Button variant="outline" size="sm">
                      Crear Campaña
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Cumpleaños</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Felicitaciones automáticas y descuentos especiales de cumpleaños
                    </p>
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}