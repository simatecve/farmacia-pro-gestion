import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, Package, Users, FileText } from "lucide-react";
import { CashDrawerButton } from "@/components/cash/CashDrawerButton";

const quickActions = [
  {
    title: "Nueva Venta",
    description: "Iniciar transacción",
    icon: ShoppingCart,
    href: "/pos",
  },
  {
    title: "Agregar Producto",
    description: "Nuevo producto",
    icon: Plus,
    href: "/inventario?action=add",
  },
  {
    title: "Nuevo Cliente",
    description: "Registrar cliente",
    icon: Users,
    href: "/clientes?action=add",
  },
  {
    title: "Generar Reporte",
    description: "Ver estadísticas",
    icon: FileText,
    href: "/reportes",
  },
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
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
                asChild
              >
                <a href={action.href}>
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </a>
              </Button>
            );
          })}
          
          {/* Botón de Apertura de Caja */}
          <div className="col-span-2">
            <CashDrawerButton 
              variant="outline" 
              className="w-full h-auto p-4 flex items-center justify-center gap-2 hover:bg-accent"
              showText={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}