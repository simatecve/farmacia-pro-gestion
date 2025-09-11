import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductDropdownProps {
  onProductSelect?: (productId: string, product: any) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  showPrice?: boolean;
  filterActive?: boolean;
}

export function ProductDropdown({ 
  onProductSelect, 
  placeholder = "Seleccionar producto", 
  value, 
  className,
  showPrice = true,
  filterActive = true 
}: ProductDropdownProps) {
  const { products, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    if (products) {
      const filtered = filterActive 
        ? products.filter(product => product.active)
        : products;
      setFilteredProducts(filtered);
    }
  }, [products, filterActive]);

  const handleValueChange = (productId: string) => {
    const selectedProduct = filteredProducts.find(p => p.id === productId);
    if (selectedProduct && onProductSelect) {
      onProductSelect(productId, selectedProduct);
    }
  };

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Error al cargar productos" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Cargando productos..." : placeholder}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {filteredProducts.length === 0 && !loading ? (
          <SelectItem value="no-products" disabled>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              No hay productos disponibles
            </div>
          </SelectItem>
        ) : (
          filteredProducts.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {product.sku && (
                      <Badge variant="outline" className="text-xs">
                        SKU: {product.sku}
                      </Badge>
                    )}
                    {product.barcode && (
                      <Badge variant="outline" className="text-xs">
                        Código: {product.barcode}
                      </Badge>
                    )}
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
                {showPrice && (
                  <div className="text-right ml-2">
                    <span className="font-medium text-sm">
                      ${product.sale_price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}