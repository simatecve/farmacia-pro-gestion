import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingCart, Package, AlertTriangle, Users } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "sale",
    title: "Venta #VT-2024-001",
    description: "Cliente: María García - $1,250.00",
    time: "Hace 5 min",
    status: "completed",
    icon: ShoppingCart
  },
  {
    id: 2,
    type: "stock",
    title: "Stock bajo: Paracetamol 500mg",
    description: "Quedan 12 unidades en inventario",
    time: "Hace 15 min",
    status: "warning",
    icon: AlertTriangle
  },
  {
    id: 3,
    type: "purchase",
    title: "Compra registrada",
    description: "Proveedor: MediFarma - 150 productos",
    time: "Hace 1 hora",
    status: "info",
    icon: Package
  },
  {
    id: 4,
    type: "customer",
    title: "Nuevo cliente registrado",
    description: "Juan Pérez - Tel: +52 55 1234-5678",
    time: "Hace 2 horas",
    status: "success",
    icon: Users
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-success text-success-foreground";
    case "warning": return "bg-warning text-warning-foreground";
    case "info": return "bg-secondary text-secondary-foreground";
    case "success": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "Completado";
    case "warning": return "Alerta";
    case "info": return "Información";
    case "success": return "Éxito";
    default: return "";
  }
};

export function RecentActivity() {
  return (
    <Card className="hover-lift transition-smooth shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-smooth"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <activity.icon className="h-4 w-4 text-accent-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(activity.status)} flex-shrink-0`}
                  >
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}