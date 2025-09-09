import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaxSettings as TaxSettingsType, useSettings } from "@/hooks/useSettings";

export function TaxSettings() {
  const { taxSettings, createTaxSetting, updateTaxSetting, deleteTaxSetting, loading } = useSettings();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxSettingsType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    description: '',
    is_default: false,
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 0,
      description: '',
      is_default: false,
      active: true
    });
    setEditingTax(null);
  };

  const handleEdit = (tax: TaxSettingsType) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      rate: tax.rate * 100, // Convert to percentage
      description: tax.description || '',
      is_default: tax.is_default,
      active: tax.active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taxData = {
        ...formData,
        rate: formData.rate / 100 // Convert percentage to decimal
      };

      if (editingTax) {
        await updateTaxSetting(editingTax.id, taxData);
        toast({
          title: "Impuesto actualizado",
          description: "La configuración de impuesto se ha actualizado correctamente",
        });
      } else {
        await createTaxSetting(taxData);
        toast({
          title: "Impuesto creado",
          description: "El nuevo impuesto se ha creado correctamente",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de impuesto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTaxSetting(id);
      toast({
        title: "Impuesto eliminado",
        description: "El impuesto se ha eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el impuesto",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Configuración de Impuestos
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Impuesto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Impuesto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="IVA, IEPS, etc."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rate">Tasa (%) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rate}
                    onChange={(e) => updateField('rate', parseFloat(e.target.value) || 0)}
                    placeholder="16.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Descripción del impuesto"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => updateField('is_default', checked)}
                  />
                  <Label htmlFor="is_default">Impuesto por defecto</Label>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Tasa</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay impuestos configurados
                  </TableCell>
                </TableRow>
              ) : (
                taxSettings.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">
                      {tax.name}
                      {tax.is_default && (
                        <Badge variant="secondary" className="ml-2">
                          Por defecto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{(tax.rate * 100).toFixed(2)}%</TableCell>
                    <TableCell>{tax.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={tax.active ? "default" : "secondary"}>
                        {tax.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tax)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tax.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}