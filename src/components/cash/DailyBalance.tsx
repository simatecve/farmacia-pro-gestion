import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, DollarSign, TrendingUp, TrendingDown, Calculator, Printer } from "lucide-react";
import { useCashRegister, CashRegisterSession } from "@/hooks/useCashRegister";
import { startOfDay, endOfDay, format, isToday } from "date-fns";
import { es } from "date-fns/locale";
// Debug component removed
interface DailyBalanceData {
  date: string;
  totalSessions: number;
  totalOpeningAmount: number;
  totalClosingAmount: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalOther: number;
  totalDifference: number;
  realBalance: number;
  theoreticalBalance: number;
  expectedAmount: number;
  sessions: CashRegisterSession[];
}

export function DailyBalance() {
  const { sessions } = useCashRegister();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [balanceData, setBalanceData] = useState<DailyBalanceData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateDailyBalance = (date: string) => {
    // Usar la fecha local del dispositivo para evitar problemas de zona horaria
    const targetDate = new Date(date + 'T00:00:00');
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    console.log('Debug - Calculando balance para fecha:', date);
    console.log('Debug - Rango de fecha:', { dayStart, dayEnd });
    console.log('Debug - Total sesiones disponibles:', sessions.length);
    
    // Filtrar sesiones por fecha de apertura O cierre usando zona horaria local
    const daySessions = sessions.filter(session => {
      // Convertir las fechas del servidor a fecha local para comparación
      const openedDate = new Date(session.opened_at);
      const closedDate = session.closed_at ? new Date(session.closed_at) : null;
      
      // Comparar solo las fechas (año, mes, día) ignorando la hora
      const openedDateStr = format(openedDate, 'yyyy-MM-dd');
      const closedDateStr = closedDate ? format(closedDate, 'yyyy-MM-dd') : null;
      const targetDateStr = date;
      
      // Incluir sesión si fue abierta en el día O cerrada en el día
      const openedInDay = openedDateStr === targetDateStr;
      const closedInDay = closedDateStr === targetDateStr;
      
      const isInRange = openedInDay || closedInDay;
      
      console.log('Debug - Sesión:', {
        id: session.id,
        opened_at: session.opened_at,
        closed_at: session.closed_at,
        openedDateStr,
        closedDateStr,
        targetDateStr,
        openedInDay,
        closedInDay,
        isInRange
      });
      
      return isInRange;
    });
    
    console.log('Debug - Sesiones filtradas para el día:', daySessions.length);
    console.log('Debug - Sesiones del día:', daySessions.map(s => ({
      id: s.id.slice(-6),
      register: s.register_name,
      opening: s.opening_amount,
      closing: s.closing_amount,
      sales: s.total_sales,
      cash: s.total_cash,
      status: s.status
    })));

    const totalOpeningAmount = daySessions.reduce((sum, session) => {
      console.log(`Sumando apertura: ${sum} + ${session.opening_amount} = ${sum + session.opening_amount}`);
      return sum + session.opening_amount;
    }, 0);
    
    const totalClosingAmount = daySessions.reduce((sum, session) => {
      const closingAmount = session.closing_amount || 0;
      console.log(`Sumando cierre: ${sum} + ${closingAmount} = ${sum + closingAmount}`);
      return sum + closingAmount;
    }, 0);
    
    const totalSales = daySessions.reduce((sum, session) => sum + session.total_sales, 0);
    const totalCash = daySessions.reduce((sum, session) => sum + session.total_cash, 0);
    const totalCard = daySessions.reduce((sum, session) => sum + session.total_card, 0);
    const totalOther = daySessions.reduce((sum, session) => sum + session.total_other, 0);
    
    // El monto esperado debe ser: apertura + efectivo recibido en ventas
    // La diferencia es: lo que realmente se cerró vs lo que debería haber
    const expectedAmount = totalOpeningAmount + totalCash;
    const totalDifference = totalClosingAmount - expectedAmount;
    
    // Calcular también el balance real (diferencia entre cierre y apertura)
    const realBalance = totalClosingAmount - totalOpeningAmount;
    const theoreticalBalance = totalCash; // Solo el efectivo debería quedar en caja

    console.log('Debug - Totales calculados:', {
      totalOpeningAmount,
      totalClosingAmount,
      totalSales,
      totalCash,
      expectedAmount,
      totalDifference,
      realBalance,
      theoreticalBalance
    });

    return {
      date,
      totalSessions: daySessions.length,
      totalOpeningAmount,
      totalClosingAmount,
      totalSales,
      totalCash,
      totalCard,
      totalOther,
      totalDifference,
      realBalance,
      theoreticalBalance,
      expectedAmount,
      sessions: daySessions
    };
  };

  useEffect(() => {
    console.log('=== INICIO DEBUG DAILY BALANCE ===');
    console.log('Fecha seleccionada:', selectedDate);
    console.log('Total sesiones disponibles:', sessions.length);
    console.log('Sesiones completas:', sessions.map(s => ({
      id: s.id.slice(-6),
      register: s.register_name,
      opened_at: s.opened_at,
      closed_at: s.closed_at,
      status: s.status,
      opening_amount: s.opening_amount,
      closing_amount: s.closing_amount,
      total_sales: s.total_sales,
      total_cash: s.total_cash
    })));
    
    const balance = calculateDailyBalance(selectedDate);
    console.log('Balance calculado:', balance);
    console.log('=== FIN DEBUG DAILY BALANCE ===');
    setBalanceData(balance);
  }, [selectedDate, sessions]);



  const handlePrintBalance = () => {
    if (!balanceData) return;
    
    const printContent = `
      BALANCE DIARIO DE CAJA\n
      Fecha: ${format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })}\n
      RESUMEN GENERAL:\n
      Total de Sesiones: ${balanceData.totalSessions}\n
      Monto de Apertura Total: $${balanceData.totalOpeningAmount.toFixed(2)}\n
      Ventas Totales: $${balanceData.totalSales.toFixed(2)}\n
      - Efectivo: $${balanceData.totalCash.toFixed(2)}\n
      - Tarjetas: $${balanceData.totalCard.toFixed(2)}\n
      - Otros: $${balanceData.totalOther.toFixed(2)}\n
      Monto de Cierre Total: $${balanceData.totalClosingAmount.toFixed(2)}\n
      Diferencia: $${balanceData.totalDifference.toFixed(2)}\n
      DETALLE POR SESIÓN:\n
      ${balanceData.sessions.map((session, index) => `
        Sesión ${index + 1} - ${session.register_name}\n
        Apertura: $${session.opening_amount.toFixed(2)}\n
        Ventas: $${session.total_sales.toFixed(2)}\n
        Cierre: $${session.closing_amount?.toFixed(2) || 'Pendiente'}\n
        Estado: ${session.status === 'open' ? 'Abierta' : 'Cerrada'}\n
      `).join('')}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Balance Diario</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!balanceData) {
    return <div>Cargando balance...</div>;
  }

  // Mostrar mensaje si no hay sesiones
  if (balanceData.totalSessions === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Balance Diario de Caja</h2>
            <p className="text-muted-foreground">Arqueo consolidado de todas las sesiones del día</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay sesiones para esta fecha</h3>
            <p className="text-muted-foreground text-center">
              No se encontraron sesiones de caja para el día {format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })}.
              <br />Selecciona otra fecha o verifica que haya sesiones registradas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Balance Diario de Caja</h2>
          <p className="text-muted-foreground">Arqueo consolidado de todas las sesiones del día</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={handlePrintBalance} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balanceData.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Apertura Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${balanceData.totalOpeningAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ventas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balanceData.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Cierre Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${balanceData.totalClosingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {balanceData.totalDifference >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              Diferencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              balanceData.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${balanceData.totalDifference.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Métodos de Pago */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Efectivo</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${balanceData.totalCash.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tarjetas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ${balanceData.totalCard.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Otros</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ${balanceData.totalOther.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Sesiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalle de Sesiones</CardTitle>
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline">Ver Detalles</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Detalle Completo de Sesiones - {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Caja</TableHead>
                        <TableHead>Apertura</TableHead>
                        <TableHead>Ventas</TableHead>
                        <TableHead>Efectivo</TableHead>
                        <TableHead>Tarjetas</TableHead>
                        <TableHead>Cierre</TableHead>
                        <TableHead>Diferencia</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceData.sessions.map((session) => {
                        const expectedAmount = session.opening_amount + session.total_cash;
                        const difference = (session.closing_amount || 0) - expectedAmount;
                        
                        return (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">{session.register_name}</TableCell>
                            <TableCell>${session.opening_amount.toFixed(2)}</TableCell>
                            <TableCell>${session.total_sales.toFixed(2)}</TableCell>
                            <TableCell>${session.total_cash.toFixed(2)}</TableCell>
                            <TableCell>${session.total_card.toFixed(2)}</TableCell>
                            <TableCell>
                              {session.closing_amount ? `$${session.closing_amount.toFixed(2)}` : 'Pendiente'}
                            </TableCell>
                            <TableCell>
                              {session.closing_amount ? (
                                <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  ${difference.toFixed(2)}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                                {session.status === 'open' ? 'Abierta' : 'Cerrada'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {balanceData.sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay sesiones registradas para esta fecha
              </div>
            ) : (
              balanceData.sessions.map((session, index) => {
                const expectedAmount = session.opening_amount + session.total_cash;
                const difference = (session.closing_amount || 0) - expectedAmount;
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{session.register_name}</div>
                      <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                        {session.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>Apertura: <span className="font-medium">${session.opening_amount.toFixed(2)}</span></div>
                      <div>Ventas: <span className="font-medium">${session.total_sales.toFixed(2)}</span></div>
                      <div>Cierre: <span className="font-medium">
                        {session.closing_amount ? `$${session.closing_amount.toFixed(2)}` : 'Pendiente'}
                      </span></div>
                      {session.closing_amount && (
                        <div className={`font-medium ${
                          difference >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Dif: ${difference.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      

    </div>
  );
}