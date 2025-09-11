import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Shield, Edit } from 'lucide-react';
import { useUserRoles, type AppRole } from '@/hooks/useUserRoles';
import { UserFormNew } from './UserFormNew';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  cashier: 'Cajero',
  viewer: 'Visualizador'
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  manager: 'bg-primary text-primary-foreground',
  cashier: 'bg-secondary text-secondary-foreground',
  viewer: 'bg-muted text-muted-foreground'
};

export function UserManagementNew() {
  const { users, currentUserRole, loading, error, canManageUsers, fetchUsers } = useUserRoles();
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!canManageUsers()) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para gestionar usuarios.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSuccess = () => {
    setShowUserForm(false);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios y sus roles en el sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUserForm(true)}
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0)?.toUpperCase() || 
                         user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {user.full_name || 'Sin nombre'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.email || 'Sin email'}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {user.roles?.map((role) => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className={roleColors[role.role]}
                          >
                            {roleLabels[role.role]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showUserForm && (
        <UserFormNew
          user={selectedUser}
          onClose={() => {
            setShowUserForm(false);
            setSelectedUser(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}