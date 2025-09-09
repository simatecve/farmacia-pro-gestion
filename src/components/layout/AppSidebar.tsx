import { useState } from "react";
import { 
  Home, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  Package2, 
  BarChart3, 
  Settings, 
  UserCheck,
  Tag,
  MapPin,
  LogOut,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Star,
  Gift,
  Bell,
  History,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// PANEL PRINCIPAL
const dashboardItems = [
  { title: "Dashboard", url: "/", icon: Home },
];

// VENTAS Y POS
const salesItems = [
  { title: "Punto de Venta", url: "/pos", icon: CreditCard },
  { title: "Ventas", url: "/ventas", icon: ShoppingCart },
  { title: "Historial de Ventas", url: "/historial-ventas", icon: History },
  { title: "Reportes", url: "/reportes", icon: BarChart3 },
];

// INVENTARIO
const inventoryItems = [
  { title: "Productos", url: "/productos", icon: Package },
  { title: "Categorías", url: "/categorias", icon: Tag },
  { title: "Ubicaciones", url: "/ubicaciones", icon: MapPin },
  { title: "Inventario", url: "/inventario", icon: Package2 },
  { title: "Compras", url: "/compras", icon: Package },
];

// GESTIÓN Y CRM
const crmItems = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Programa Fidelización", url: "/fidelizacion", icon: Star },
  { title: "Gestión de Clientes", url: "/gestion-clientes", icon: Activity },
  { title: "Campañas", url: "/campanias", icon: Gift },
  { title: "Recordatorios", url: "/recordatorios", icon: Bell },
];

// ADMINISTRACIÓN
const adminItems = [
  { title: "Usuarios", url: "/usuarios", icon: UserCheck },
  { title: "Configuración", url: "/configuracion", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
        "w-64 shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Daalef Farmacia</h2>
                <p className="text-xs text-gray-500">Sistema de Gestión v1.0.0</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Panel Principal */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Panel Principal
            </h3>
            <nav className="space-y-1">
              {dashboardItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Ventas y POS */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
              Ventas y POS
            </h3>
            <nav className="space-y-1">
              {salesItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary/10 text-secondary border border-secondary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Inventario */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Inventario
            </h3>
            <nav className="space-y-1">
              {inventoryItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Gestión y CRM */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
              Gestión y CRM
            </h3>
            <nav className="space-y-1">
              {crmItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary/10 text-secondary border border-secondary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Administración */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Administración
            </h3>
            <nav className="space-y-1">
              {adminItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground border border-border"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin Usuario</p>
              <p className="text-xs text-muted-foreground truncate">admin@daalef.com</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  );
}