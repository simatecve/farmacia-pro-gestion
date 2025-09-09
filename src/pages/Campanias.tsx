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
import { Search, Plus, Gift, Mail, Calendar, Target, CheckCircle, Clock } from "lucide-react";

export default function Campanias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data para campañas
  const campaigns = [
    {
      id: "1",
      name: "Promoción Vitaminas",
      description: "Descuento 20% en vitaminas",
      campaign_type: "promotional",
      target_criteria: { min_purchases: 100 },
      message_template: "¡Aprovecha 20% de descuento en todas las vitaminas!",
      start_date: "2024-01-15",
      end_date: "2024-01-31",
      active: true,
      created_at: "2024-01-10"
    },
    {
      id: "2",
      name: "Recordatorio Medicamentos",
      description: "Recordatorio mensual para medicamentos crónicos",
      campaign_type: "reminder",
      target_criteria: { has_chronic_medication: true },
      message_template: "Es hora de renovar tu medicamento. ¡Visítanos!",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      active: true,
      created_at: "2024-01-01"
    },
    {
      id: "3",
      name: "Cumpleaños Especial",
      description: "Felicitación y descuento por cumpleaños",
      campaign_type: "birthday",
      target_criteria: { birthday_month: true },
      message_template: "¡Feliz cumpleaños! Disfruta de un 15% de descuento especial",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      active: true,
      created_at: "2024-01-01"
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCampaigns = campaigns.filter(c => c.active);
  const promotionalCampaigns = campaigns.filter(c => c.campaign_type === 'promotional');
  const reminderCampaigns = campaigns.filter(c => c.campaign_type === 'reminder');

  const getCampaignTypeLabel = (type: string) => {
    const types = {
      promotional: "Promocional",
      reminder: "Recordatorio",
      birthday: "Cumpleaños",
      loyalty: "Fidelidad"
    };
    return types[type as keyof typeof types] || type;
  };

  const getCampaignTypeColor = (type: string) => {
    const colors = {
      promotional: "default",
      reminder: "secondary",
      birthday: "outline",
      loyalty: "destructive"
    };
    return colors[type as keyof typeof colors] || "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campañas de Marketing</h1>
          <p className="text-muted-foreground">Gestiona campañas promocionales y comunicaciones con clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la campaña</Label>
                  <Input id="name" placeholder="Ej: Promoción Primavera" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de campaña</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                      <SelectItem value="birthday">Cumpleaños</SelectItem>
                      <SelectItem value="loyalty">Fidelidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de inicio</Label>
                  <Input id="start_date" type="date" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de fin</Label>
                  <Input id="end_date" type="date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" placeholder="Descripción breve de la campaña" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Plantilla del mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Mensaje que se enviará a los clientes..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Campaña
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Target className="w-5 h-5" />
              {campaigns.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {activeCampaigns.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Promocionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {promotionalCampaigns.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {reminderCampaigns.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Campañas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campañas..."
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
                <TableHead>Campaña</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alcance</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">{campaign.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCampaignTypeColor(campaign.campaign_type) as any}>
                      {getCampaignTypeLabel(campaign.campaign_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(campaign.start_date).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        hasta {new Date(campaign.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.active ? "default" : "secondary"} className="gap-1">
                      {campaign.active ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {campaign.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span>Segmentada</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Mail className="w-3 h-3" />
                        Enviar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron campañas con ese criterio de búsqueda.' : 'No hay campañas registradas.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}