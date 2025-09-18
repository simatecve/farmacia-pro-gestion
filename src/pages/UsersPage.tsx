import React, { useState } from 'react';
import { Users, Plus, Settings, Shield, AlertCircle } from 'lucide-react';
import { UserList } from '@/components/users/UserList';
import { UserForm } from '@/components/users/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/roles';

interface SelectedUser {
  user_id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
}

export const UsersPage: React.FC = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { hasPermission, isAdmin, user } = useAuth();
  
  const canManageUsers = hasPermission('manage_users');
  const isUserAdmin = isAdmin();

  // Handle opening form for new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  // Handle opening form for editing user
  const handleEditUser = (user: SelectedUser) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  // Handle closing form
  const handleCloseForm = () => {
    setShowUserForm(false);
    setSelectedUser(null);
  };

  // Handle successful form submission
  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUserForm(false);
    setSelectedUser(null);
  };

  // If user doesn't have permission to manage users, show access denied
  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Denegado
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              No tienes permisos para acceder a la gestión de usuarios.
            </p>
            <p className="text-xs text-gray-400">
              Contacta con un administrador si necesitas acceso a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Usuarios
                </h1>
                <p className="text-sm text-gray-500">
                  Administra usuarios, roles y permisos del sistema
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>
                  Conectado como: <span className="font-medium text-gray-700">{user?.profile?.full_name || user?.email}</span>
                </span>
                {isUserAdmin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
              </div>
              
              {/* Create User Button */}
              <button
                onClick={handleCreateUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Usuarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Cargando...
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Administradores
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Cargando...
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Cargando...
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <UserList 
              onCreateUser={() => {}}
              onEditUser={handleEditUser}
              onDeleteUser={() => {}}
            />
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          isOpen={showUserForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default UsersPage;