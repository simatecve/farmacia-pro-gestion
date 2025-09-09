import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, CreditCard, Eye } from 'lucide-react';
import { type AppRole } from '@/hooks/useUserRoles';

interface RoleManagerProps {
  onClose: () => void;
}

const roleConfig = {
  admin: {
    label: 'Administrador',
    icon: Shield,
    color: 'bg-destructive text-destructive-foreground',
    description: 'Acceso completo al sistema',
    permissions: [
      'Gestión completa de usuarios y roles',
      'Configuración del sistema',
      'Acceso a todos los módulos',
      'Gestión de webhooks y integraciones',
      'Auditoría y logs del sistema',
      'Configuración de empresa y dispositivos'
    ]
  },
  manager: {
    label: 'Gerente',
    icon: Users,
    color: 'bg-primary text-primary-foreground',
    description: 'Gestión operativa del negocio',
    permissions: [
      'Gestión de inventario y productos',
      'Reportes y análisis de ventas',
      'Gestión de clientes y proveedores',
      'Configuración de promociones',
      'Acceso a programas de fidelización',
      'Gestión de devoluciones'
    ]
  },
  cashier: {
    label: 'Cajero',
    icon: CreditCard,
    color: 'bg-secondary text-secondary-foreground',
    description: 'Operaciones de punto de venta',
    permissions: [
      'Punto de venta (POS)',
      'Control de caja',
      'Procesamiento de ventas',
      'Consulta de productos',
      'Gestión básica de clientes',
      'Impresión de recibos'
    ]
  },
  viewer: {
    label: 'Visualizador',
    icon: Eye,
    color: 'bg-muted text-muted-foreground',
    description: 'Solo lectura de información',
    permissions: [
      'Ver dashboard y estadísticas',
      'Consultar inventario',
      'Ver historial de ventas',
      'Consultar clientes',
      'Ver reportes básicos',
      'Sin permisos de modificación'
    ]
  }
};

export function RoleManager({ onClose }: RoleManagerProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestión de Roles</DialogTitle>
          <DialogDescription>
            Información sobre los roles del sistema y sus permisos
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(roleConfig) as AppRole[]).map((role) => {
            const config = roleConfig[role];
            const IconComponent = config.icon;
            
            return (
              <Card key={role} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <Badge className={config.color} variant="secondary">
                          {role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Permisos
                    </h4>
                    <ul className="space-y-2">
                      {config.permissions.map((permission, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Jerarquía de Roles</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Los roles siguen una jerarquía donde los niveles superiores incluyen todos los permisos de los niveles inferiores:
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Badge className={roleConfig.admin.color}>Administrador</Badge>
            <span>→</span>
            <Badge className={roleConfig.manager.color}>Gerente</Badge>
            <span>→</span>
            <Badge className={roleConfig.cashier.color}>Cajero</Badge>
            <span>→</span>
            <Badge className={roleConfig.viewer.color}>Visualizador</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}