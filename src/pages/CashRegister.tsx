import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, Clock, CheckCircle, XCircle, Calculator } from "lucide-react";
import { useCashRegister } from "@/hooks/useCashRegister";
import { useToast } from "@/hooks/use-toast";
import { DailyBalance } from "@/components/cash/DailyBalance";
import { CashCloseTicket } from "@/components/cash/CashCloseTicket";

export default function CashRegister() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [notes, setNotes] = useState("");
  
  const { sessions, currentSession, loading, openRegister, closeRegister, refreshSessions } = useCashRegister();
  const { toast } = useToast();

  const filteredSessions = sessions.filter(session =>
    session.register_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Ingrese un monto válido",
        variant: "destructive"
      });
      return;
    }

    const result = await openRegister(amount);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Caja abierta",
        description: `Caja abierta con $${amount.toFixed(2)}`
      });
      setOpenDialog(false);
      setOpeningAmount("");
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    const amount = parseFloat(closingAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Ingrese un monto válido",
        variant: "destructive"
      });
      return;
    }

    const result = await closeRegister(currentSession.id, amount, notes);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Caja cerrada",
        description: `Caja cerrada con $${amount.toFixed(2)}`
      });
      setCloseDialog(false);
      setClosingAmount("");
      setNotes("");
      
      // Mostrar opción de imprimir ticket después del cierre
      if (result.data) {
        setTimeout(() => {
          const shouldPrint = window.confirm('¿Desea imprimir el ticket de cierre de caja?');
          if (shouldPrint) {
            // El ticket se imprimirá automáticamente
          }
        }, 500);
      }
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
          <h1 className="text-3xl font-bold text-foreground">Control de Caja</h1>
          <p className="text-muted-foreground">Gestiona las sesiones de apertura y cierre de caja</p>
        </div>
        <div className="flex gap-2">
          {!currentSession ? (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  Abrir Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Caja</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOpenRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="opening_amount">Monto de apertura ($)</Label>
                    <Input
                      id="opening_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Abrir Caja</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Cerrar Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cerrar Caja</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCloseRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Apertura</p>
                      <p className="font-bold">${currentSession.opening_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ventas</p>
                      <p className="font-bold">${currentSession.total_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Efectivo</p>
                      <p className="font-bold">${currentSession.total_cash.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Esperado</p>
                      <p className="font-bold">${(currentSession.opening_amount + currentSession.total_cash).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="closing_amount">Monto de cierre ($)</Label>
                    <Input
                      id="closing_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={closingAmount}
                      onChange={(e) => setClosingAmount(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCloseDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="destructive">Cerrar Caja</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Current Session Status */}
      {currentSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              Caja Abierta - {currentSession.register_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Apertura</p>
                <p className="text-lg font-bold">${currentSession.opening_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-lg font-bold">${currentSession.total_sales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efectivo</p>
                <p className="text-lg font-bold">${currentSession.total_cash.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarjetas</p>
                <p className="text-lg font-bold">${currentSession.total_card.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          <TabsTrigger value="balance" className="gap-2">
            <Calculator className="w-4 h-4" />
            Balance Diario
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Sesiones</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar sesiones..."
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
                    <TableHead>Caja</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Ventas</TableHead>
                    <TableHead>Cierre</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const difference = session.closing_amount 
                      ? session.closing_amount - (session.opening_amount + session.total_cash)
                      : null;
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <div>{new Date(session.opened_at).toLocaleDateString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(session.opened_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{session.register_name}</TableCell>
                        <TableCell>${session.opening_amount.toFixed(2)}</TableCell>
                        <TableCell>${session.total_sales.toFixed(2)}</TableCell>
                        <TableCell>
                          {session.closing_amount ? `$${session.closing_amount.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          {difference !== null ? (
                            <span className={difference >= 0 ? 'text-success' : 'text-destructive'}>
                              ${difference.toFixed(2)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                            {session.status === 'open' ? 'Abierta' : 'Cerrada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.status === 'closed' && (
                            <CashCloseTicket session={session} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredSessions.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron sesiones con ese criterio de búsqueda.' : 'No hay sesiones registradas.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="balance">
          <DailyBalance />
        </TabsContent>
      </Tabs>
    </div>
  );
}