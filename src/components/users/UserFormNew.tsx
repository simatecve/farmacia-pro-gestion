import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserRoles, type AppRole, type UserProfile } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';

interface UserFormNewProps {
  user?: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  cashier: 'Cajero',
  viewer: 'Visualizador'
};

const roleDescriptions: Record<AppRole, string> = {
  admin: 'Acceso completo al sistema',
  manager: 'Gestión de inventario, ventas y reportes',
  cashier: 'Punto de venta y operaciones básicas',
  viewer: 'Solo lectura de información'
};

export function UserFormNew({ user, onClose, onSuccess }: UserFormNewProps) {
  const { updateProfile, assignRole, removeRole, canManageRole } = useUserRoles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const [selectedRoles, setSelectedRoles] = useState<Set<AppRole>>(
    new Set(user?.roles?.map(r => r.role) || ['viewer'])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoles.size === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un rol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // Update existing user
        const profileResult = await updateProfile(user.id, formData);
        if (!profileResult.success) {
          throw new Error(profileResult.error);
        }

        // Handle role changes
        const currentRoles = new Set(user.roles?.map(r => r.role) || []);
        
        // Remove roles that are no longer selected
        for (const role of currentRoles) {
          if (!selectedRoles.has(role)) {
            await removeRole(user.id, role);
          }
        }

        // Add new roles
        for (const role of selectedRoles) {
          if (!currentRoles.has(role)) {
            await assignRole(user.id, role);
          }
        }

        toast({
          title: "Usuario actualizado",
          description: "Los cambios se han guardado correctamente",
        });
      } else {
        toast({
          title: "Información",
          description: "La creación de usuarios requiere configuración adicional de la base de datos.",
          variant: "destructive",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: AppRole, checked: boolean) => {
    const newRoles = new Set(selectedRoles);
    if (checked) {
      newRoles.add(role);
    } else {
      newRoles.delete(role);
    }
    setSelectedRoles(newRoles);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Modifica la información y roles del usuario' : 'Crea un nuevo usuario en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                disabled={!!user}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Roles del usuario</Label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(roleLabels) as AppRole[]).filter(role => canManageRole(role)).map((role) => (
                <div key={role} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={role}
                    checked={selectedRoles.has(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={role} className="font-medium">
                        {roleLabels[role]}
                      </Label>
                      <Badge variant="outline">{role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {roleDescriptions[role]}
                    </p>
                  </div>
                </div>
              ))}
              {(Object.keys(roleLabels) as AppRole[]).filter(role => !canManageRole(role)).length > 0 && (
                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <p>Algunos roles no están disponibles según tus permisos actuales.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}