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
import { Search, Plus, Bell, Calendar, Pill, Clock, CheckCircle, Send } from "lucide-react";
import { useClients } from "@/hooks/useClients";

export default function Recordatorios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { clients } = useClients();

  // Mock data para recordatorios
  const reminders = [
    {
      id: "1",
      client_id: "1",
      client: { name: "María González" },
      reminder_type: "medication",
      title: "Renovar Metformina",
      message: "Es hora de renovar tu prescripción de Metformina. Te esperamos en la farmacia.",
      reminder_date: "2024-01-20T09:00:00.000Z",
      sent: false,
      sent_at: null,
      created_at: "2024-01-15T10:00:00.000Z"
    },
    {
      id: "2",
      client_id: "2",
      client: { name: "Carlos Pérez" },
      reminder_type: "appointment",
      title: "Cita con farmacéutico",
      message: "Tienes una cita programada mañana para consulta farmacéutica.",
      reminder_date: "2024-01-19T14:00:00.000Z",
      sent: true,
      sent_at: "2024-01-18T09:00:00.000Z",
      created_at: "2024-01-10T15:00:00.000Z"
    },
    {
      id: "3",
      client_id: "3",
      client: { name: "Ana Martín" },
      reminder_type: "birthday",
      title: "Feliz Cumpleaños",
      message: "¡Feliz cumpleaños Ana! Disfruta de un 15% de descuento en toda la farmacia.",
      reminder_date: "2024-01-25T10:00:00.000Z",
      sent: false,
      sent_at: null,
      created_at: "2024-01-01T12:00:00.000Z"
    }
  ];

  const filteredReminders = reminders.filter(reminder =>
    reminder.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReminders = reminders.filter(r => !r.sent);
  const sentReminders = reminders.filter(r => r.sent);
  const todayReminders = reminders.filter(r => {
    const reminderDate = new Date(r.reminder_date);
    const today = new Date();
    return reminderDate.toDateString() === today.toDateString();
  });

  const getReminderTypeLabel = (type: string) => {
    const types = {
      medication: "Medicamento",
      appointment: "Cita",
      refill: "Reposición",
      birthday: "Cumpleaños"
    };
    return types[type as keyof typeof types] || type;
  };

  const getReminderTypeColor = (type: string) => {
    const colors = {
      medication: "default",
      appointment: "secondary",
      refill: "outline",
      birthday: "destructive"
    };
    return colors[type as keyof typeof colors] || "default";
  };

  const getReminderTypeIcon = (type: string) => {
    const icons = {
      medication: Pill,
      appointment: Calendar,
      refill: Bell,
      birthday: Bell
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recordatorios</h1>
          <p className="text-muted-foreground">Gestiona recordatorios y notificaciones para clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Recordatorio</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de recordatorio</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medicamento</SelectItem>
                      <SelectItem value="appointment">Cita</SelectItem>
                      <SelectItem value="refill">Reposición</SelectItem>
                      <SelectItem value="birthday">Cumpleaños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder_date">Fecha del recordatorio</Label>
                  <Input id="reminder_date" type="datetime-local" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Ej: Renovar medicamento" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Mensaje que se enviará al cliente..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Recordatorio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {reminders.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {pendingReminders.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {sentReminders.length}
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
              {todayReminders.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Recordatorios</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recordatorios..."
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
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Recordatorio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.map((reminder) => {
                const IconComponent = getReminderTypeIcon(reminder.reminder_type);
                return (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">
                      {reminder.client.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getReminderTypeColor(reminder.reminder_type) as any} className="gap-1">
                        <IconComponent className="w-3 h-3" />
                        {getReminderTypeLabel(reminder.reminder_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reminder.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {reminder.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(reminder.reminder_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(reminder.reminder_date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reminder.sent ? "default" : "secondary"} className="gap-1">
                        {reminder.sent ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {reminder.sent ? "Enviado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        {!reminder.sent && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Send className="w-3 h-3" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredReminders.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron recordatorios con ese criterio de búsqueda.' : 'No hay recordatorios registrados.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}