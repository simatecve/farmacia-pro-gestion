import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, UserRole, ROLE_DESCRIPTIONS } from '@/lib/roles';

interface UserFormData {
  email: string;
  full_name: string;
  roles: UserRole[];
}

interface UserFormProps {
  user?: {
    user_id: string;
    email: string;
    full_name: string;
    roles: UserRole[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    roles: [ROLES.VIEWER]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { createUser, updateUserRoles } = useUserManagement();
  const { isAdmin, hasPermission } = useAuth();

  const isEditing = !!user;
  const canManageUsers = hasPermission('manage_users');
  const canAssignAdminRole = isAdmin();

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        roles: user.roles && user.roles.length > 0 ? user.roles : [ROLES.VIEWER]
      });
    } else {
      setFormData({
        email: '',
        full_name: '',
        roles: [ROLES.VIEWER]
      });
    }
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  }, [user, isOpen]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Roles validation
    if (!formData.roles || formData.roles.length === 0) {
      errors.roles = 'Debe asignar al menos un rol';
    }

    // Check if user can assign admin/manager roles
    if (!canAssignAdminRole && formData.roles.some(role => [ROLES.ADMIN, ROLES.MANAGER].includes(role))) {
      errors.roles = 'No tienes permisos para asignar roles de administrador o manager';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (isEditing && user) {
        // Update existing user roles
        result = await updateUserRoles(user.user_id, formData.roles);
      } else {
        // Create new user
        result = await createUser({
          email: formData.email.trim(),
          fullName: formData.full_name.trim(),
          roles: formData.roles
        });
      }

      if (result.success) {
        setSuccess(isEditing ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Error inesperado al procesar la solicitud');
      console.error('Error in form submission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle role toggle
  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      const hasRole = currentRoles.includes(role);
      
      let newRoles: UserRole[];
      if (hasRole) {
        // Remove role, but ensure at least one role remains
        newRoles = currentRoles.filter(r => r !== role);
        if (newRoles.length === 0) {
          newRoles = [ROLES.VIEWER]; // Default to viewer if no roles
        }
      } else {
        // Add role
        newRoles = [...currentRoles, role];
      }
      
      return { ...prev, roles: newRoles };
    });
    
    // Clear role validation error
    if (validationErrors.roles) {
      setValidationErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  // Get available roles based on user permissions
  const getAvailableRoles = (): UserRole[] => {
    if (canAssignAdminRole) {
      return [ROLES.VIEWER, ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN];
    } else {
      return [ROLES.VIEWER, ROLES.CASHIER];
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole, isSelected: boolean) => {
    const baseColors = {
      [ROLES.ADMIN]: 'border-red-300 text-red-700',
      [ROLES.MANAGER]: 'border-blue-300 text-blue-700',
      [ROLES.CASHIER]: 'border-green-300 text-green-700',
      [ROLES.VIEWER]: 'border-gray-300 text-gray-700'
    };

    const selectedColors = {
      [ROLES.ADMIN]: 'bg-red-100 border-red-500 text-red-800',
      [ROLES.MANAGER]: 'bg-blue-100 border-blue-500 text-blue-800',
      [ROLES.CASHIER]: 'bg-green-100 border-green-500 text-green-800',
      [ROLES.VIEWER]: 'bg-gray-100 border-gray-500 text-gray-800'
    };

    return isSelected ? selectedColors[role] : `bg-white ${baseColors[role]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (validationErrors.email) {
                        setValidationErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    disabled={isEditing || loading}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      validationErrors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } ${isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
                {isEditing && (
                  <p className="mt-1 text-xs text-gray-500">El email no se puede modificar</p>
                )}
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, full_name: e.target.value }));
                    if (validationErrors.full_name) {
                      setValidationErrors(prev => ({ ...prev, full_name: '' }));
                    }
                  }}
                  disabled={loading}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                    validationErrors.full_name
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Nombre y apellidos del usuario"
                />
                {validationErrors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
                )}
              </div>

              {/* Roles Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Roles *
                </label>
                <div className="space-y-2">
                  {getAvailableRoles().map((role) => {
                    const isSelected = formData.roles.includes(role);
                    const isDisabled = loading;
                    
                    return (
                      <div key={role} className="flex items-start">
                        <button
                          type="button"
                          onClick={() => !isDisabled && handleRoleToggle(role)}
                          disabled={isDisabled}
                          className={`flex-1 text-left p-3 border-2 rounded-lg transition-all duration-200 ${
                            getRoleBadgeColor(role, isSelected)
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm capitalize">{role}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {ROLE_DESCRIPTIONS[role]}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-current border-current' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20">
                                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
                {validationErrors.roles && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.roles}</p>
                )}
                {!canAssignAdminRole && (
                  <p className="mt-1 text-xs text-gray-500">
                    Solo puedes asignar roles de Viewer y Cashier
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !canManageUsers}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;