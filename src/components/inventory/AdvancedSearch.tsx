import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Package, Barcode, Scan } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { useProducts } from '@/hooks/useProducts';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface AdvancedSearchProps {
  onProductSelect: (product: Product) => void;
  onSearchChange?: (term: string, results: Product[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function AdvancedSearch({
  onProductSelect,
  onSearchChange,
  placeholder = "Buscar productos por nombre, código o laboratorio...",
  className = "",
  disabled = false,
  autoFocus = false
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showBarcodeIndicator, setShowBarcodeIndicator] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook para obtener productos
  const { products } = useProducts();

  // Hook para escáner de código de barras
  const {
    isScanning,
    lastScannedCode,
    buffer,
    scanBarcode,
    clearBuffer
  } = useBarcodeScanner({
    onScan: (result) => {
      setSearchTerm(result.code);
      setShowBarcodeIndicator(true);
      performSearch(result.code);
      
      // Ocultar indicador después de 3 segundos
      setTimeout(() => {
        setShowBarcodeIndicator(false);
      }, 3000);
    },
    minLength: 8,
    timeout: 500
  });

  // Función de búsqueda
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      onSearchChange?.('', []);
      return;
    }

    setIsSearching(true);
    try {
      const searchLower = term.toLowerCase();
      const results = products.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.code?.toLowerCase().includes(searchLower) ||
          product.laboratory?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 10); // Limitar a 10 resultados
      
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSelectedIndex(-1);
      onSearchChange?.(term, results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [products, onSearchChange]);

  // Búsqueda con debounce
  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(term);
    }, 300);
  }, [performSearch]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Iniciar escáner automáticamente
  useEffect(() => {
    // El escáner se inicia automáticamente con el hook
    return () => clearBuffer();
  }, [clearBuffer]);

  // Manejar selección de producto
  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setShowBarcodeIndicator(false);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`pl-10 pr-20 ${showBarcodeIndicator ? 'ring-2 ring-green-500' : ''}`}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showBarcodeIndicator && (
            <Badge variant="default" className="bg-green-500 text-white animate-pulse">
              <Barcode className="h-3 w-3 mr-1" />
              Escaneado
            </Badge>
          )}
          {isScanning && (
            <Badge variant="secondary" className="animate-pulse">
              <Scan className="h-3 w-3 mr-1" />
              Escaneando...
            </Badge>
          )}
          {buffer && (
            <Badge variant="outline" className="text-xs">
              {buffer}
            </Badge>
          )}
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Instrucciones de uso */}
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
        <Scan className="h-3 w-3" />
        Escanea un código de barras o escribe para buscar
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
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Código: {product.code}
                      </span>
                      {product.laboratory && (
                        <span className="text-sm text-muted-foreground">
                          Lab: {product.laboratory}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.current_stock}
                      </span>
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