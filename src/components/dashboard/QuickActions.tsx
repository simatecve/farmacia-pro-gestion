import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, Package, Users, FileText } from "lucide-react";

const quickActions = [
  {
    title: "Nueva Venta",
    description: "Registrar venta rápida",
    icon: ShoppingCart,
    variant: "primary" as const,
    href: "/ventas/nueva"
  },
  {
    title: "Agregar Producto",
    description: "Nuevo medicamento/producto",
    icon: Package,
    variant: "secondary" as const,
    href: "/productos/nuevo"
  },
  {
    title: "Nuevo Cliente",
    description: "Registrar cliente",
    icon: Users,
    variant: "outline" as const,
    href: "/clientes/nuevo"
  },
  {
    title: "Generar Reporte",
    description: "Reporte de ventas/inventario",
    icon: FileText,
    variant: "outline" as const,
    href: "/reportes"
  }
];

export function QuickActions() {
  return (
    <Card className="hover-lift transition-smooth shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start gap-2 hover-scale transition-smooth"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left w-full">
                  {action.description}
                </p>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}