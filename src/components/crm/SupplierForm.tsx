import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useSuppliers, type Supplier } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createSupplier, updateSupplier } = useSuppliers();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact_name: supplier?.contact_name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    tax_id: supplier?.tax_id || '',
    payment_terms: supplier?.payment_terms || '',
    notes: supplier?.notes || '',
    active: supplier?.active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = supplier 
        ? await updateSupplier(supplier.id, formData)
        : await createSupplier(formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: supplier ? "Proveedor actualizado correctamente" : "Proveedor creado correctamente"
        });
        setOpen(false);
        onSuccess?.();
        if (!supplier) {
          setFormData({
            name: '',
            contact_name: '',
            email: '',
            phone: '',
            address: '',
            tax_id: '',
            payment_terms: '',
            notes: '',
            active: true
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {supplier ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_name">Persona de contacto</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_id">RUC/NIT</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleChange('tax_id', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Términos de pago</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleChange('payment_terms', e.target.value)}
                placeholder="ej: 30 días"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange('active', checked)}
            />
            <Label htmlFor="active">Proveedor activo</Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : supplier ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}