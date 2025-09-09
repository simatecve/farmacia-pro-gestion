import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLoyaltyPlans, type LoyaltyPlan } from "@/hooks/useLoyaltyPlans";
import { useToast } from "@/hooks/use-toast";

interface LoyaltyPlanFormProps {
  plan?: LoyaltyPlan;
  onSuccess?: () => void;
}

export function LoyaltyPlanForm({ plan, onSuccess }: LoyaltyPlanFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createPlan, updatePlan } = useLoyaltyPlans();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    points_per_currency: plan?.points_per_currency || 1,
    currency_per_point: plan?.currency_per_point || 0.01,
    min_purchase_for_points: plan?.min_purchase_for_points || 0,
    points_expiry_days: plan?.points_expiry_days || 365,
    welcome_points: plan?.welcome_points || 0,
    birthday_points: plan?.birthday_points || 0,
    referral_points: plan?.referral_points || 0,
    active: plan?.active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = plan 
        ? await updatePlan(plan.id, formData)
        : await createPlan(formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: plan ? "Plan actualizado correctamente" : "Plan creado correctamente"
        });
        setOpen(false);
        onSuccess?.();
        if (!plan) {
          setFormData({
            name: '',
            description: '',
            points_per_currency: 1,
            currency_per_point: 0.01,
            min_purchase_for_points: 0,
            points_expiry_days: 365,
            welcome_points: 0,
            birthday_points: 0,
            referral_points: 0,
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

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {plan ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plan de Fidelización' : 'Nuevo Plan de Fidelización'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del plan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points_per_currency">Puntos por cada $1 *</Label>
              <Input
                id="points_per_currency"
                type="number"
                step="0.01"
                min="0"
                value={formData.points_per_currency}
                onChange={(e) => handleChange('points_per_currency', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency_per_point">Valor de cada punto ($) *</Label>
              <Input
                id="currency_per_point"
                type="number"
                step="0.001"
                min="0"
                value={formData.currency_per_point}
                onChange={(e) => handleChange('currency_per_point', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_purchase_for_points">Compra mínima para puntos ($)</Label>
              <Input
                id="min_purchase_for_points"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase_for_points}
                onChange={(e) => handleChange('min_purchase_for_points', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points_expiry_days">Días de expiración de puntos</Label>
              <Input
                id="points_expiry_days"
                type="number"
                min="1"
                value={formData.points_expiry_days}
                onChange={(e) => handleChange('points_expiry_days', parseInt(e.target.value) || 365)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome_points">Puntos de bienvenida</Label>
              <Input
                id="welcome_points"
                type="number"
                min="0"
                value={formData.welcome_points}
                onChange={(e) => handleChange('welcome_points', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthday_points">Puntos de cumpleaños</Label>
              <Input
                id="birthday_points"
                type="number"
                min="0"
                value={formData.birthday_points}
                onChange={(e) => handleChange('birthday_points', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referral_points">Puntos por referido</Label>
              <Input
                id="referral_points"
                type="number"
                min="0"
                value={formData.referral_points}
                onChange={(e) => handleChange('referral_points', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange('active', checked)}
            />
            <Label htmlFor="active">Plan activo</Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : plan ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}