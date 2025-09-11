import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Package, Plus, AlertTriangle, Scan, ScanLine, Eye } from "lucide-react";
import { useProductsWithStock, ProductWithStock } from "@/hooks/useProductsWithStock";
import { useToast } from "@/hooks/use-toast";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { ProductDetails } from "./ProductDetails";

interface ProductSearchProps {
  onAddProduct: (product: ProductWithStock) => void;
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { products, loading } = useProductsWithStock();
  const { toast } = useToast();
  const { 
    lastBarcodeEvent, 
    startBarcodeListening, 
    stopBarcodeListening, 
    isBarcodeListening,
    getDevicesByType 
  } = useDeviceDetection();

  const barcodeReaders = getDevicesByType('barcode_reader');

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products.slice(0, 20)); // Show first 20 products
    } else {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = products.filter((product) => {
        // Search in name, SKU, and barcode with better matching
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const skuMatch = product.sku?.toLowerCase().includes(searchLower);
        const barcodeMatch = product.barcode?.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
        
        return nameMatch || skuMatch || barcodeMatch || descriptionMatch;
      });
      setFilteredProducts(filtered.slice(0, 20));
    }
  }, [searchTerm, products]);

  // Manejar eventos de código de barras automático
  useEffect(() => {
    if (lastBarcodeEvent && lastBarcodeEvent.code) {
      handleBarcodeSearch(lastBarcodeEvent.code);
    }
  }, [lastBarcodeEvent]);

  // Iniciar escucha de códigos de barras al montar
  useEffect(() => {
    startBarcodeListening();
    return () => stopBarcodeListening();
  }, []);

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      handleAddProduct(product);
      setSearchTerm("");
    }
  };

  const handleManualSearch = (searchValue: string) => {
    // First try exact barcode match
    let product = products.find(p => p.barcode === searchValue);
    
    // If no barcode match, try SKU
    if (!product) {
      product = products.find(p => p.sku?.toLowerCase() === searchValue.toLowerCase());
    }
    
    // If still no match, try name
    if (!product) {
      product = products.find(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    // If still no match, try first from filtered results
    if (!product && filteredProducts.length > 0) {
      product = filteredProducts[0];
    }
    
    if (product) {
      handleAddProduct(product);
      setSearchTerm("");
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró ningún producto con: ${searchValue}`,
        variant: "destructive"
      });
    }
  };

  const handleShowProductDetails = (product: ProductWithStock) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleAddToCart = (product: ProductWithStock, quantity: number) => {
    // Find the original ProductWithStock from our products list
    const originalProduct = products.find(p => p.id === product.id);
    if (!originalProduct) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el producto en el inventario",
        variant: "destructive"
      });
      return;
    }
    
    // Add the specified quantity to cart
    for (let i = 0; i < quantity; i++) {
      onAddProduct(originalProduct);
    }
  };

  const handleQuickAdd = (product: ProductWithStock) => {
    // For quick add (+ button), show details if requires prescription, otherwise add directly
    if (product.requires_prescription) {
      handleShowProductDetails(product);
    } else {
      onAddProduct(product);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Buscar Productos</CardTitle>
          <div className="flex items-center gap-2">
            {barcodeReaders.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Scan className="h-3 w-3 mr-1" />
                {barcodeReaders.length} lector{barcodeReaders.length > 1 ? 'es' : ''}
              </Badge>
            )}
            <Badge 
              variant={isBarcodeListening ? "default" : "secondary"} 
              className="text-xs"
            >
              <ScanLine className="h-3 w-3 mr-1" />
              {isBarcodeListening ? 'Escuchando' : 'Desactivado'}
            </Badge>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                handleManualSearch(searchTerm.trim());
              }
            }}
            className="pl-10"
          />
        </div>
        
        {isBarcodeListening && (
          <Alert className="mt-2">
            <ScanLine className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Sistema listo para recibir códigos de barras automáticamente
            </AlertDescription>
          </Alert>
        )}
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
                <div className="text-xs mt-2 space-y-1">
                  <p>Total productos disponibles: {products.length}</p>
                  <p>Término de búsqueda: "{searchTerm}"</p>
                  {products.length === 0 && (
                    <p className="text-orange-600">⚠️ No hay productos en la base de datos</p>
                  )}
                </div>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleShowProductDetails(product)}
                >
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
                      {product.requires_prescription && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Receta
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowProductDetails(product);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd(product);
                      }}
                      disabled={(product.current_stock || 0) <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
      
      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => {
          setShowProductDetails(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </Card>
  );
}