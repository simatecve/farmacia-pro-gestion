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
        // Search in name and barcode with better matching
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const barcodeMatch = product.barcode?.toLowerCase().includes(searchLower);
        // Note: description not available in ProductWithStock interface
        
        return nameMatch || barcodeMatch;
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
    // Primero actualizar el término de búsqueda para mostrar el producto en el filtro
    setSearchTerm(barcode);
    
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      // Pequeño delay para que se vea el producto en el filtro antes de agregarlo
      setTimeout(() => {
        onAddProduct(product);
        toast({
          title: "Producto agregado",
          description: `${product.name} agregado al carrito`,
        });
      }, 300);
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró producto con código: ${barcode}`,
        variant: "destructive"
      });
    }
  };

  const handleManualSearch = (searchValue: string) => {
    // First try exact barcode match
    let product = products.find(p => p.barcode === searchValue);
    
    
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
      onAddProduct(product);
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
            placeholder="Buscar por nombre o código de barras..."
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
          <div className="h-[calc(100vh-320px)] overflow-y-auto space-y-3 pr-2">
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
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleShowProductDetails(product)}
                >
                  <div className="flex items-start gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-muted rounded-lg border flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-2 line-clamp-2">{product.name}</h4>
                      
                      {/* Price and Stock */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">${product.sale_price.toFixed(2)}</span>
                        <Badge variant={
                          (product.current_stock || 0) > 0 ? "default" : "destructive"
                        } className="text-xs">
                          Stock: {product.current_stock || 0}
                        </Badge>
                      </div>
                      
                      {/* Prescription */}
                      {product.requires_prescription && (
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Receta
                          </Badge>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowProductDetails(product);
                          }}
                          className="flex items-center gap-1 flex-1"
                        >
                          <Eye className="h-3 w-3" />
                          Ver Detalles
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(product);
                          }}
                          disabled={(product.current_stock || 0) <= 0}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </div>
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