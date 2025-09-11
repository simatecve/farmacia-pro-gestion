import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Scan, X, Package, Barcode } from 'lucide-react';
import { useBarcodeScanner, BarcodeResult } from '@/hooks/useBarcodeScanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  sale_price: number;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface AdvancedSearchProps {
  onProductSelect?: (product: Product) => void;
  onSearchChange?: (searchTerm: string, results: Product[]) => void;
  placeholder?: string;
  showResults?: boolean;
  maxResults?: number;
  className?: string;
  selectedProductId?: string;
  value?: string;
}

export function AdvancedSearch({
  onProductSelect,
  onSearchChange,
  placeholder = "Buscar producto por nombre, SKU, código de barras...",
  showResults = true,
  maxResults = 10,
  className = "",
  selectedProductId,
  value
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBarcodeIndicator, setShowBarcodeIndicator] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { toast } = useToast();

  // Configurar scanner de código de barras
  const { isScanning, lastScannedCode, buffer } = useBarcodeScanner({
    onScan: handleBarcodeScanned,
    onError: (error) => {
      toast.error(`Error de código de barras: ${error}`);
    },
    minLength: 6,
    maxLength: 25,
    timeout: 150
  });

  // Manejar código de barras escaneado
  async function handleBarcodeScanned(result: BarcodeResult) {
    setShowBarcodeIndicator(true);
    
    if (result.found && result.product) {
      setSearchTerm(result.code);
      setSearchResults([result.product as Product]);
      onProductSelect?.(result.product as Product);
      toast.success(`Producto encontrado: ${result.product.name}`);
    } else {
      setSearchTerm(result.code);
      toast.warning(`No se encontró producto con código: ${result.code}`);
      // Buscar manualmente por si acaso
      await performSearch(result.code);
    }
    
    setTimeout(() => setShowBarcodeIndicator(false), 2000);
  }

  // Realizar búsqueda en la base de datos
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      onSearchChange?.(term, []);
      return;
    }

    setIsSearching(true);
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          barcode,
          sale_price,
          description,
          category:categories (
            id,
            name
          )
        `)
        .or(`name.ilike.%${term}%,sku.ilike.%${term}%,barcode.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(maxResults);

      if (error) {
        throw error;
      }

      const formattedProducts: Product[] = (products || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        sale_price: product.sale_price,
        description: product.description,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name
        } : undefined
      }));

      setSearchResults(formattedProducts);
      setSelectedIndex(-1);
      onSearchChange?.(term, formattedProducts);
      
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Error",
        description: "Error al buscar productos",
        variant: "destructive"
      });
      setSearchResults([]);
      onSearchChange?.(term, []);
    } finally {
      setIsSearching(false);
    }
  }, [maxResults, onSearchChange]);

  // Cargar producto seleccionado
  useEffect(() => {
    if (selectedProductId && !searchTerm) {
      const loadSelectedProduct = async () => {
        try {
          const { data: product, error } = await supabase
            .from('products')
            .select(`
              id,
              name,
              sku,
              barcode,
              sale_price,
              description,
              category:categories (
                id,
                name
              )
            `)
            .eq('id', selectedProductId)
            .single();

          if (error) throw error;

          if (product) {
            setSearchTerm(product.name);
          }
        } catch (error) {
          console.error('Error loading selected product:', error);
        }
      };

      loadSelectedProduct();
    }
  }, [selectedProductId]);

  // Sincronizar con valor externo
  useEffect(() => {
    if (value !== undefined && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Manejar teclas de navegación
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setSearchResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Manejar selección de producto
  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
    setSearchTerm(product.name);
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedIndex(-1);
    onSearchChange?.('', []);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          {(isScanning || showBarcodeIndicator) && (
            <div className="flex items-center gap-1">
              <Scan className="w-4 h-4 text-blue-500 animate-pulse" />
              <Badge variant="outline" className="text-xs">
                {isScanning ? 'Escaneando...' : 'Código detectado'}
              </Badge>
            </div>
          )}
          {buffer && (
            <Badge variant="secondary" className="text-xs">
              <Barcode className="w-3 h-3 mr-1" />
              {buffer}
            </Badge>
          )}
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-10"
        />
        
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        {isSearching && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.map((product, index) => (
              <div
                key={product.id}
                className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                  index === selectedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>SKU: {product.sku}</span>
                      {product.barcode && (
                        <span className="flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {product.barcode}
                        </span>
                      )}
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">${product.sale_price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}