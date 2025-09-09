import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Plus, Minus, TrendingUp, Gift, Settings } from "lucide-react";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useClients } from "@/hooks/useClients";
import { useLoyaltyPlans } from "@/hooks/useLoyaltyPlans";
import { LoyaltyPlanForm } from "@/components/loyalty/LoyaltyPlanForm";
import { useToast } from "@/hooks/use-toast";

export default function Fidelizacion() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [actionType, setActionType] = useState<"add" | "redeem">("add");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { transactions, loading, addPoints, redeemPoints, refreshTransactions } = useLoyalty();
  const { clients } = useClients();
  const { plans, activePlan, refreshPlans } = useLoyaltyPlans();
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPointsEarned = transactions
    .filter(t => t.transaction_type === 'earn')
    .reduce((sum, t) => sum + t.points, 0);

  const totalPointsRedeemed = transactions
    .filter(t => t.transaction_type === 'redeem')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !points) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const pointsNumber = parseInt(points);
    if (pointsNumber <= 0) {
      toast({
        title: "Error",
        description: "Los puntos deben ser un número positivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = actionType === "add" 
        ? await addPoints(selectedClient, pointsNumber, description)
        : await redeemPoints(selectedClient, pointsNumber, description);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: actionType === "add" 
            ? `Se agregaron ${pointsNumber} puntos correctamente`
            : `Se canjearon ${pointsNumber} puntos correctamente`
        });
        setDialogOpen(false);
        setSelectedClient("");
        setPoints("");
        setDescription("");
        refreshTransactions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Programa de Fidelización</h1>
          <p className="text-muted-foreground">Gestiona los puntos de fidelidad de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <LoyaltyPlanForm onSuccess={refreshPlans} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Star className="w-4 h-4" />
                Gestionar Puntos
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Puntos de Fidelidad</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.loyalty_points} puntos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action">Acción</Label>
                <Select value={actionType} onValueChange={(value: "add" | "redeem") => setActionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Agregar puntos</SelectItem>
                    <SelectItem value="redeem">Canjear puntos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Cantidad de puntos</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Motivo de la transacción..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {actionType === "add" ? "Agregar Puntos" : "Canjear Puntos"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Configuration Section */}
      {activePlan && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="w-5 h-5" />
              Plan Activo: {activePlan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Puntos por $1</p>
                <p className="text-lg font-bold">{activePlan.points_per_currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor por punto</p>
                <p className="text-lg font-bold">${activePlan.currency_per_point.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compra mínima</p>
                <p className="text-lg font-bold">${activePlan.min_purchase_for_points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Puntos bienvenida</p>
                <p className="text-lg font-bold">{activePlan.welcome_points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Puntos Otorgados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {totalPointsEarned.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Puntos Canjeados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary flex items-center gap-2">
              <Minus className="w-5 h-5" />
              {totalPointsRedeemed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Puntos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              <Star className="w-5 h-5" />
              {clients.reduce((sum, c) => sum + c.loyalty_points, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {transactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Transacciones</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    Cliente ID: {transaction.client_id}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.transaction_type === 'earn' ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      {transaction.transaction_type === 'earn' ? (
                        <Plus className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {transaction.transaction_type === 'earn' ? 'Ganó' : 'Canjeó'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={
                      transaction.transaction_type === 'earn' 
                        ? 'text-success font-medium' 
                        : 'text-destructive font-medium'
                    }>
                      {transaction.transaction_type === 'earn' ? '+' : ''}
                      {transaction.points}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.description || (
                      <span className="text-muted-foreground italic">Sin descripción</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron transacciones con ese criterio de búsqueda.' : 'No hay transacciones de fidelidad registradas.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}