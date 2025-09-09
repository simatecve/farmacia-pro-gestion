import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Printer, CreditCard, Scan, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeviceSettings as DeviceSettingsType, useSettings } from "@/hooks/useSettings";

const deviceTypes = [
  { value: 'printer', label: 'Impresora', icon: Printer },
  { value: 'cash_drawer', label: 'Gaveta de Dinero', icon: CreditCard },
  { value: 'barcode_reader', label: 'Lector de Código', icon: Scan },
  { value: 'scale', label: 'Báscula', icon: Scale },
];

const connectionTypes = [
  { value: 'usb', label: 'USB' },
  { value: 'network', label: 'Red (IP)' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'serial', label: 'Puerto Serial' },
];

export function DeviceSettings() {
  const { deviceSettings, createDeviceSetting, updateDeviceSetting, deleteDeviceSetting, loading } = useSettings();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceSettingsType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    device_type: '',
    device_name: '',
    connection_type: '',
    connection_config: {},
    is_default: false,
    active: true,
    settings: {}
  });

  const resetForm = () => {
    setFormData({
      device_type: '',
      device_name: '',
      connection_type: '',
      connection_config: {},
      is_default: false,
      active: true,
      settings: {}
    });
    setEditingDevice(null);
  };

  const handleEdit = (device: DeviceSettingsType) => {
    setEditingDevice(device);
    setFormData({
      device_type: device.device_type,
      device_name: device.device_name,
      connection_type: device.connection_type,
      connection_config: device.connection_config || {},
      is_default: device.is_default,
      active: device.active,
      settings: device.settings || {}
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingDevice) {
        await updateDeviceSetting(editingDevice.id, formData);
        toast({
          title: "Dispositivo actualizado",
          description: "La configuración del dispositivo se ha actualizado correctamente",
        });
      } else {
        await createDeviceSetting(formData);
        toast({
          title: "Dispositivo creado",
          description: "El nuevo dispositivo se ha configurado correctamente",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración del dispositivo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeviceSetting(id);
      toast({
        title: "Dispositivo eliminado",
        description: "El dispositivo se ha eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el dispositivo",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getDeviceIcon = (type: string) => {
    const deviceType = deviceTypes.find(d => d.value === type);
    return deviceType ? deviceType.icon : Printer;
  };

  const getDeviceLabel = (type: string) => {
    const deviceType = deviceTypes.find(d => d.value === type);
    return deviceType ? deviceType.label : type;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Dispositivos y Periféricos
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device_type">Tipo de Dispositivo *</Label>
                  <Select value={formData.device_type} onValueChange={(value) => updateField('device_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="device_name">Nombre del Dispositivo *</Label>
                  <Input
                    id="device_name"
                    value={formData.device_name}
                    onChange={(e) => updateField('device_name', e.target.value)}
                    placeholder="Ej: Impresora Principal"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection_type">Tipo de Conexión *</Label>
                  <Select value={formData.connection_type} onValueChange={(value) => updateField('connection_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de conexión" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => updateField('is_default', checked)}
                  />
                  <Label htmlFor="is_default">Dispositivo por defecto</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => updateField('active', checked)}
                  />
                  <Label htmlFor="active">Activo</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conexión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay dispositivos configurados
                  </TableCell>
                </TableRow>
              ) : (
                deviceSettings.map((device) => {
                  const IconComponent = getDeviceIcon(device.device_type);
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {device.device_name}
                          {device.is_default && (
                            <Badge variant="secondary" className="ml-2">
                              Por defecto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getDeviceLabel(device.device_type)}</TableCell>
                      <TableCell>
                        {connectionTypes.find(t => t.value === device.connection_type)?.label || device.connection_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={device.active ? "default" : "secondary"}>
                          {device.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(device)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(device.id)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}