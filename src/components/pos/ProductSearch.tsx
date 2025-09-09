import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  sale_price: number;
  current_stock?: number;
  unit_type: string;
}

interface ProductSearchProps {
  onAddProduct: (product: Product) => void;
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products, loading } = useProducts();

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products.slice(0, 20)); // Show first 20 products
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 20));
    }
  }, [searchTerm, products]);

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      onAddProduct(product);
      setSearchTerm("");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Buscar Productos</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                handleBarcodeSearch(searchTerm.trim());
              }
            }}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Cargando productos...</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        ${product.sale_price.toFixed(2)}
                      </Badge>
                      {product.sku && (
                        <Badge variant="secondary" className="text-xs">
                          SKU: {product.sku}
                        </Badge>
                      )}
                      <Badge variant={
                        (product.current_stock || 0) > 0 ? "default" : "destructive"
                      } className="text-xs">
                        Stock: {product.current_stock || 0}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddProduct(product);
                    }}
                    disabled={(product.current_stock || 0) <= 0}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}