import { useCashRegister } from "@/hooks/useCashRegister";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function CashDebug() {
  const { sessions, loading, error } = useCashRegister();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug - Sesiones de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Total de sesiones:</strong> {sessions.length}
          </div>
          
          <div className="space-y-2">
            <strong>Sesiones encontradas:</strong>
            {sessions.length === 0 ? (
              <p>No hay sesiones en la base de datos</p>
            ) : (
              sessions.map((session, index) => (
                <div key={session.id} className="border p-2 rounded">
                  <p><strong>Sesión {index + 1}:</strong></p>
                  <p>ID: {session.id}</p>
                  <p>Caja: {session.register_name}</p>
                  <p>Estado: {session.status}</p>
                  <p>Apertura: ${session.opening_amount}</p>
                  <p>Cierre: {session.closing_amount ? `$${session.closing_amount}` : 'Pendiente'}</p>
                  <p>Fecha apertura: {format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                  <p>Fecha cierre: {session.closed_at ? format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'No cerrada'}</p>
                  <p>Ventas totales: ${session.total_sales}</p>
                  <p>Efectivo: ${session.total_cash}</p>
                  <p>Tarjetas: ${session.total_card}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}