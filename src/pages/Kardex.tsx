import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { FileText, Search, Download, Filter, TrendingUp, TrendingDown, Package, Calendar, User, MapPin } from 'lucide-react';
import { AdvancedSearch, Product } from '@/components/inventory/AdvancedSearch';
import { useInventory, InventoryMovement } from '@/hooks/useInventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

type MovementType = 'entrada' | 'salida' | 'ajuste' | 'venta' | 'compra' | 'devolucion' | 'transferencia';

interface KardexFilters {
  searchTerm: string;
  movementType: InventoryMovement['movement_type'] | 'all';
  location: string;
  dateRange: DateRange | undefined;
  selectedProduct: Product | null;
}

export default function Kardex() {
  const { movements, loading } = useInventory();
  const [filters, setFilters] = useState<KardexFilters>({
    searchTerm: '',
    movementType: 'all',
    location: 'all',
    dateRange: undefined,
    selectedProduct: null
  });

  // Filtrar movimientos basado en los filtros aplicados
  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          movement.product?.name.toLowerCase().includes(searchLower) ||
          movement.product?.sku?.toLowerCase().includes(searchLower) ||
          (movement.product as any)?.barcode?.toLowerCase().includes(searchLower) ||
          movement.batch_number?.toLowerCase().includes(searchLower) ||
          movement.notes?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de movimiento
       if (filters.movementType !== 'all' && movement.movement_type !== filters.movementType) {
         return false;
       }

      // Filtro por ubicación
      if (filters.location !== 'all' && movement.location?.id !== filters.location) {
        return false;
      }

      // Filtro por rango de fechas
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const movementDate = new Date(movement.created_at);
        if (filters.dateRange.from && movementDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && movementDate > filters.dateRange.to) return false;
      }

      return true;
    });
  }, [movements, filters]);

  // Estadísticas del kardex
  const stats = useMemo(() => {
    const totalMovements = filteredMovements.length;
    const entradas = filteredMovements.filter(m => m.movement_type === 'entrada' || m.movement_type === 'compra').length;
    const salidas = filteredMovements.filter(m => m.movement_type === 'salida' || m.movement_type === 'venta').length;
    const ajustes = filteredMovements.filter(m => m.movement_type === 'ajuste').length;
    
    return { totalMovements, entradas, salidas, ajustes };
  }, [filteredMovements]);

  // Obtener ubicaciones únicas para el filtro
  const locations = useMemo(() => {
    const uniqueLocations = movements.reduce((acc, movement) => {
      if (movement.location && !acc.find(loc => loc.id === movement.location.id)) {
        acc.push(movement.location);
      }
      return acc;
    }, [] as any[]);
    return uniqueLocations;
  }, [movements]);

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'entrada':
      case 'compra':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'salida':
      case 'venta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'devolucion':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'transferencia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada':
      case 'compra':
        return <TrendingUp className="w-4 h-4" />;
      case 'salida':
      case 'venta':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Producto', 'SKU', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Posterior', 'Costo', 'Ubicación', 'Lote', 'Usuario', 'Notas'];
    
    const csvData = filteredMovements.map(movement => [
      format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      movement.product?.name || '',
      movement.product?.sku || '',
      movement.movement_type,
      movement.quantity,
      movement.stock_before || 0,
      movement.stock_after || 0,
      movement.total_cost || 0,
      movement.location?.name || '',
      movement.batch_number || '',
      movement.user_id || '',
      movement.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kardex_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando kardex...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Kardex de Inventario
          </h1>
          <p className="text-muted-foreground">Historial completo de movimientos de inventario</p>
        </div>
        
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Movimientos</p>
                <p className="text-2xl font-bold">{stats.totalMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{stats.entradas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Salidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.salidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ajustes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.ajustes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda avanzada */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Producto</label>
              <AdvancedSearch
                placeholder="Buscar por nombre, SKU, código..."
                onSearchChange={(term) => {
                  setFilters(prev => ({ ...prev, searchTerm: term }));
                }}
                onProductSelect={(product) => {
                  setFilters(prev => ({ 
                    ...prev, 
                    selectedProduct: product,
                    searchTerm: product.name 
                  }));
                }}
                showResults={true}
                className="w-full"
              />
            </div>

            {/* Tipo de movimiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Movimiento</label>
              <Select 
                value={filters.movementType} 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, movementType: value as MovementType | 'all' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="devolucion">Devolución</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Select 
                value={filters.location} 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de fechas */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rango de Fechas</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => 
                  setFilters(prev => ({ ...prev, dateRange }))
                }
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                searchTerm: '',
                movementType: 'all',
                location: 'all',
                dateRange: undefined,
                selectedProduct: null
              })}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Movimientos de Kardex ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filters.searchTerm || filters.movementType !== 'all' || filters.location !== 'all' || filters.dateRange
                ? 'No se encontraron movimientos con los filtros aplicados'
                : 'No hay movimientos registrados'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha
                      </div>
                    </TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Stock Anterior</TableHead>
                    <TableHead className="text-right">Stock Posterior</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ubicación
                      </div>
                    </TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Usuario
                      </div>
                    </TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(movement.created_at), 'dd/MM/yyyy\nHH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.product?.name}</div>
                          {(movement.product as any)?.description && (
                            <div className="text-sm text-muted-foreground">
                              {(movement.product as any).description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.product?.sku}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getMovementTypeColor(movement.movement_type)} flex items-center gap-1 w-fit`}
                        >
                          {getMovementTypeIcon(movement.movement_type)}
                          {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {movement.stock_before || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {movement.stock_after || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${(movement.total_cost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {movement.location?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.batch_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {movement.user?.name || 'Sistema'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {movement.notes && (
                          <div className="text-sm text-muted-foreground truncate" title={movement.notes}>
                            {movement.notes}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}