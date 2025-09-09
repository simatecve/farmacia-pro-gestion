import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

// Mock data
const productos = [
  {
    id: 1,
    nombre: "Paracetamol 500mg",
    categoria: "Analgésico",
    precio: 15.50,
    stock: 120,
    stockMinimo: 20,
    vencimiento: "2025-06-15",
    proveedor: "MediFarma",
    codigo: "PAR500-001"
  },
  {
    id: 2,
    nombre: "Ibuprofeno 400mg",
    categoria: "Antiinflamatorio",
    precio: 22.30,
    stock: 8,
    stockMinimo: 15,
    vencimiento: "2025-03-20",
    proveedor: "FarmaPlus",
    codigo: "IBU400-002"
  },
  {
    id: 3,
    nombre: "Amoxicilina 500mg",
    categoria: "Antibiótico",
    precio: 45.00,
    stock: 65,
    stockMinimo: 25,
    vencimiento: "2024-12-15",
    proveedor: "MediFarma",
    codigo: "AMO500-003"
  }
];

const getStockStatus = (stock: number, stockMinimo: number) => {
  if (stock <= stockMinimo) {
    return { text: "Stock Bajo", color: "bg-warning text-warning-foreground" };
  }
  return { text: "En Stock", color: "bg-success text-success-foreground" };
};

const isExpiringSoon = (vencimiento: string) => {
  const today = new Date();
  const expDate = new Date(vencimiento);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 90; // Próximo a vencer en 90 días
};

const Productos = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Productos
            </h1>
            <p className="text-muted-foreground">
              Gestión de medicamentos y productos de la farmacia
            </p>
          </div>
          <Button className="hover-scale primary-gradient shadow-pharmacy">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre, código o categoría..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="hover-scale">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-lift transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-2xl font-bold">1,248</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Por Vencer</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Stock</p>
                  <p className="text-2xl font-bold">1,217</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-muted-foreground">Producto</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Categoría</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Precio</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Vencimiento</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => {
                    const stockStatus = getStockStatus(producto.stock, producto.stockMinimo);
                    const expiringSoon = isExpiringSoon(producto.vencimiento);
                    
                    return (
                      <tr key={producto.id} className="border-b hover:bg-accent/50 transition-smooth">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-sm text-muted-foreground">{producto.codigo}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{producto.categoria}</Badge>
                        </td>
                        <td className="p-4 font-medium">${producto.precio}</td>
                        <td className="p-4">
                          <span className="font-medium">{producto.stock}</span>
                          <span className="text-sm text-muted-foreground ml-1">unidades</span>
                        </td>
                        <td className="p-4">
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className={`${expiringSoon ? 'text-warning' : ''}`}>
                            {new Date(producto.vencimiento).toLocaleDateString('es-ES')}
                            {expiringSoon && (
                              <p className="text-xs text-warning flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                Próximo a vencer
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="hover-scale">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="hover-scale text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Productos;