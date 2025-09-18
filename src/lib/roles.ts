// Sistema de roles y permisos para la aplicación

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Jerarquía de roles (de mayor a menor privilegio)
export const ROLE_HIERARCHY: UserRole[] = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.CASHIER,
  ROLES.VIEWER,
];

// Descripciones de roles
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: {
    name: 'Administrador',
    description: 'Acceso completo al sistema, puede gestionar usuarios y configuraciones',
    color: 'red',
  },
  [ROLES.MANAGER]: {
    name: 'Gerente',
    description: 'Puede gestionar inventario, ventas y usuarios básicos',
    color: 'blue',
  },
  [ROLES.CASHIER]: {
    name: 'Cajero',
    description: 'Puede realizar ventas y consultar inventario',
    color: 'green',
  },
  [ROLES.VIEWER]: {
    name: 'Visualizador',
    description: 'Solo puede ver información, sin permisos de modificación',
    color: 'gray',
  },
} as const;

// Permisos específicos por módulo
export const PERMISSIONS = {
  // Gestión de usuarios
  USERS: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    ASSIGN_ROLES: 'users:assign_roles',
  },
  // Gestión de inventario
  INVENTORY: {
    VIEW: 'inventory:view',
    CREATE: 'inventory:create',
    UPDATE: 'inventory:update',
    DELETE: 'inventory:delete',
    IMPORT: 'inventory:import',
    EXPORT: 'inventory:export',
  },
  // Gestión de ventas
  SALES: {
    VIEW: 'sales:view',
    CREATE: 'sales:create',
    UPDATE: 'sales:update',
    DELETE: 'sales:delete',
    REFUND: 'sales:refund',
  },
  // Reportes
  REPORTS: {
    VIEW: 'reports:view',
    EXPORT: 'reports:export',
    ADVANCED: 'reports:advanced',
  },
  // Configuración del sistema
  SETTINGS: {
    VIEW: 'settings:view',
    UPDATE: 'settings:update',
    BACKUP: 'settings:backup',
    RESTORE: 'settings:restore',
  },
} as const;

// Mapeo de roles a permisos
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.ADMIN]: [
    // Usuarios - acceso completo
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
    PERMISSIONS.USERS.ASSIGN_ROLES,
    // Inventario - acceso completo
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.CREATE,
    PERMISSIONS.INVENTORY.UPDATE,
    PERMISSIONS.INVENTORY.DELETE,
    PERMISSIONS.INVENTORY.IMPORT,
    PERMISSIONS.INVENTORY.EXPORT,
    // Ventas - acceso completo
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.UPDATE,
    PERMISSIONS.SALES.DELETE,
    PERMISSIONS.SALES.REFUND,
    // Reportes - acceso completo
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.EXPORT,
    PERMISSIONS.REPORTS.ADVANCED,
    // Configuración - acceso completo
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.SETTINGS.UPDATE,
    PERMISSIONS.SETTINGS.BACKUP,
    PERMISSIONS.SETTINGS.RESTORE,
  ],
  [ROLES.MANAGER]: [
    // Usuarios - gestión básica
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
    // Inventario - acceso completo
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.CREATE,
    PERMISSIONS.INVENTORY.UPDATE,
    PERMISSIONS.INVENTORY.DELETE,
    PERMISSIONS.INVENTORY.IMPORT,
    PERMISSIONS.INVENTORY.EXPORT,
    // Ventas - acceso completo
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.UPDATE,
    PERMISSIONS.SALES.DELETE,
    PERMISSIONS.SALES.REFUND,
    // Reportes - acceso avanzado
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.EXPORT,
    PERMISSIONS.REPORTS.ADVANCED,
    // Configuración - solo visualización
    PERMISSIONS.SETTINGS.VIEW,
  ],
  [ROLES.CASHIER]: [
    // Usuarios - solo visualización
    PERMISSIONS.USERS.VIEW,
    // Inventario - consulta y actualización básica
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.UPDATE,
    // Ventas - operaciones básicas
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.UPDATE,
    // Reportes - solo visualización
    PERMISSIONS.REPORTS.VIEW,
  ],
  [ROLES.VIEWER]: [
    // Usuarios - solo visualización
    PERMISSIONS.USERS.VIEW,
    // Inventario - solo visualización
    PERMISSIONS.INVENTORY.VIEW,
    // Ventas - solo visualización
    PERMISSIONS.SALES.VIEW,
    // Reportes - solo visualización
    PERMISSIONS.REPORTS.VIEW,
  ],
};

// Utilidades para verificar permisos
export class RoleManager {
  /**
   * Verifica si un rol tiene un permiso específico
   */
  static hasPermission(role: UserRole, permission: string): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  }

  /**
   * Verifica si un usuario con ciertos roles tiene un permiso específico
   */
  static userHasPermission(userRoles: UserRole[], permission: string): boolean {
    return userRoles.some(role => this.hasPermission(role, permission));
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  static getRolePermissions(role: UserRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Obtiene todos los permisos de un usuario basado en sus roles
   */
  static getUserPermissions(userRoles: UserRole[]): string[] {
    const permissions = new Set<string>();
    userRoles.forEach(role => {
      this.getRolePermissions(role).forEach(permission => {
        permissions.add(permission);
      });
    });
    return Array.from(permissions);
  }

  /**
   * Verifica si un rol puede asignar otro rol
   */
  static canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
    const assignerIndex = ROLE_HIERARCHY.indexOf(assignerRole);
    const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
    
    // Solo se puede asignar roles de menor o igual jerarquía
    return assignerIndex <= targetIndex;
  }

  /**
   * Verifica si un usuario puede asignar un rol específico
   */
  static userCanAssignRole(userRoles: UserRole[], targetRole: UserRole): boolean {
    // Obtener el rol de mayor jerarquía del usuario
    const highestRole = this.getHighestRole(userRoles);
    return highestRole ? this.canAssignRole(highestRole, targetRole) : false;
  }

  /**
   * Obtiene el rol de mayor jerarquía de una lista de roles
   */
  static getHighestRole(roles: UserRole[]): UserRole | null {
    if (roles.length === 0) return null;
    
    let highestRole = roles[0];
    let highestIndex = ROLE_HIERARCHY.indexOf(highestRole);
    
    for (const role of roles) {
      const index = ROLE_HIERARCHY.indexOf(role);
      if (index < highestIndex) {
        highestRole = role;
        highestIndex = index;
      }
    }
    
    return highestRole;
  }

  /**
   * Verifica si un rol es válido
   */
  static isValidRole(role: string): role is UserRole {
    return Object.values(ROLES).includes(role as UserRole);
  }

  /**
   * Obtiene la información descriptiva de un rol
   */
  static getRoleInfo(role: UserRole) {
    return ROLE_DESCRIPTIONS[role];
  }

  /**
   * Obtiene todos los roles disponibles
   */
  static getAllRoles(): UserRole[] {
    return Object.values(ROLES);
  }

  /**
   * Obtiene los roles que un usuario puede asignar
   */
  static getAssignableRoles(userRoles: UserRole[]): UserRole[] {
    const highestRole = this.getHighestRole(userRoles);
    if (!highestRole) return [];
    
    const highestIndex = ROLE_HIERARCHY.indexOf(highestRole);
    return ROLE_HIERARCHY.slice(highestIndex);
  }

  /**
   * Verifica si un usuario es administrador
   */
  static isAdmin(userRoles: UserRole[]): boolean {
    return userRoles.includes(ROLES.ADMIN);
  }

  /**
   * Verifica si un usuario es gerente o superior
   */
  static isManagerOrAbove(userRoles: UserRole[]): boolean {
    return userRoles.some(role => [ROLES.ADMIN as UserRole, ROLES.MANAGER as UserRole].includes(role));
  }

  /**
   * Verifica si un usuario puede realizar operaciones de venta
   */
  static canMakeSales(userRoles: UserRole[]): boolean {
    return this.userHasPermission(userRoles, PERMISSIONS.SALES.CREATE);
  }

  /**
   * Verifica si un usuario puede gestionar inventario
   */
  static canManageInventory(userRoles: UserRole[]): boolean {
    return this.userHasPermission(userRoles, PERMISSIONS.INVENTORY.UPDATE);
  }

  /**
   * Verifica si un usuario puede gestionar otros usuarios
   */
  static canManageUsers(userRoles: UserRole[]): boolean {
    return this.userHasPermission(userRoles, PERMISSIONS.USERS.CREATE);
  }
}

// Exportar utilidades comunes
export const {
  hasPermission,
  userHasPermission,
  getRolePermissions,
  getUserPermissions,
  canAssignRole,
  userCanAssignRole,
  getHighestRole,
  isValidRole,
  getRoleInfo,
  getAllRoles,
  getAssignableRoles,
  isAdmin,
  isManagerOrAbove,
  canMakeSales,
  canManageInventory,
  canManageUsers,
} = RoleManager;