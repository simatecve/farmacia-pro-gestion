import React from 'react';
import { useUserRoles, type AppRole } from '@/hooks/useUserRoles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleProtectionProps {
  children: React.ReactNode;
  requiredRole: AppRole;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function RoleProtection({ 
  children, 
  requiredRole, 
  fallback, 
  showError = true 
}: RoleProtectionProps) {
  const { currentUserRole, hasRole, loading } = useUserRoles();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos suficientes para acceder a esta funcionalidad. 
            Se requiere el rol: <strong>{requiredRole}</strong>
            {currentUserRole && (
              <span className="block mt-1">
                Tu rol actual: <strong>{currentUserRole}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

// Hook para verificar permisos de manera más granular
export function useRolePermissions() {
  const { hasRole, currentUserRole } = useUserRoles();

  const permissions = {
    // Permisos de administración
    canManageUsers: hasRole('admin') || hasRole('manager'),
    canManageSystem: hasRole('admin'),
    canViewReports: hasRole('admin') || hasRole('manager'),
    
    // Permisos de inventario
    canManageInventory: hasRole('admin') || hasRole('manager'),
    canViewInventory: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
    
    // Permisos de ventas
    canProcessSales: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
    canViewSales: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
    canManageSales: hasRole('admin') || hasRole('manager'),
    
    // Permisos de clientes
    canManageClients: hasRole('admin') || hasRole('manager'),
    canViewClients: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
    
    // Permisos de configuración
    canManageSettings: hasRole('admin'),
    canViewSettings: hasRole('admin') || hasRole('manager'),
    
    // Permisos de caja
    canManageCash: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
    
    // Permisos de productos
    canManageProducts: hasRole('admin') || hasRole('manager'),
    canViewProducts: hasRole('admin') || hasRole('manager') || hasRole('cashier'),
  };

  return {
    ...permissions,
    currentUserRole,
    hasRole,
  };
}