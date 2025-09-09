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
import { Search, Plus, AlertTriangle, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export default function Auditoria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTable, setFilterTable] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  
  const { logs, loading, fetchLogs, refreshLogs } = useAuditLogs();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = filterTable === "all" || log.table_name === filterTable;
    const matchesAction = filterAction === "all" || log.action === filterAction;
    
    return matchesSearch && matchesTable && matchesAction;
  });

  const uniqueTables = [...new Set(logs.map(log => log.table_name).filter(Boolean))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.created_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-3 h-3" />;
      case 'UPDATE': return <TrendingUp className="w-3 h-3" />;
      case 'DELETE': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterTable("all");
    setFilterAction("all");
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
          <h1 className="text-3xl font-bold text-foreground">Auditoría del Sistema</h1>
          <p className="text-muted-foreground">Registro completo de todas las acciones realizadas en el sistema</p>
        </div>
        <Button onClick={refreshLogs} variant="outline">
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {logs.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {todayLogs.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Creaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {logs.filter(l => l.action === 'INSERT').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eliminaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {logs.filter(l => l.action === 'DELETE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registro de Auditoría</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tabla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tablas</SelectItem>
                  {uniqueTables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionColor(log.action) as any} className="gap-1">
                      {getActionIcon(log.action)}
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.table_name || '-'}
                  </TableCell>
                  <TableCell>
                    {log.user_id ? (
                      <span className="text-sm font-mono">{log.user_id.slice(-8)}</span>
                    ) : (
                      <span className="text-muted-foreground">Sistema</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de Auditoría</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>ID del registro</Label>
                              <p className="font-mono text-sm">{log.record_id || 'N/A'}</p>
                            </div>
                            <div>
                              <Label>Usuario</Label>
                              <p className="font-mono text-sm">{log.user_id || 'Sistema'}</p>
                            </div>
                          </div>
                          
                          {log.old_values && (
                            <div>
                              <Label>Valores anteriores</Label>
                              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.new_values && (
                            <div>
                              <Label>Valores nuevos</Label>
                              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterTable || filterAction ? 'No se encontraron registros con los filtros aplicados.' : 'No hay registros de auditoría.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}