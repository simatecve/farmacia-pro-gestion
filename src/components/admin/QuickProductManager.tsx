import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// Seed data utility removed

export function QuickProductManager() {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    barcode: '',
    sale_price: '',
    stock: ''
  });
  const { toast } = useToast();

  // Seed data function removed

  const handleAddProduct = async () => {
    if (!productData.name || !productData.sale_price) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y precio son obligatorios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First, get or create a default category
      let { data: categories } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (!categories || categories.length === 0) {
        const { data: newCategory } = await supabase
          .from('categories')
          .insert([{ name: 'General', description: 'Categoría general' }])
          .select()
          .single();
        categories = [newCategory];
      }

      // Create the product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          barcode: productData.barcode || null,
          sale_price: parseFloat(productData.sale_price),
          purchase_price: parseFloat(productData.sale_price) * 0.7, // 30% margin
          min_stock: 5,
          max_stock: 100,
          unit_type: 'unidad',
          active: true,
          requires_prescription: false,
          category_id: categories[0].id
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Get or create default location
      let { data: locations } = await supabase
        .from('locations')
        .select('*')
        .limit(1);
      
      if (!locations || locations.length === 0) {
        const { data: newLocation } = await supabase
          .from('locations')
          .insert([{ name: 'Principal', description: 'Ubicación principal' }])
          .select()
          .single();
        locations = [newLocation];
      }

      // Create inventory entry
      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert([{
          product_id: newProduct.id,
          location_id: locations[0].id,
          current_stock: parseInt(productData.stock) || 0
        }]);

      if (inventoryError) throw inventoryError;

      toast({
        title: "Producto agregado",
        description: `${productData.name} se agregó correctamente`,
      });

      // Reset form
      setProductData({
        name: '',
        barcode: '',
        sale_price: '',
        stock: ''
      });

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error al agregar producto",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión Rápida de Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-4">
            <h3 className="font-semibold mb-3">Agregar Producto Individual</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del producto"
                />
              </div>
                <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={productData.barcode}
                  onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Código de barras"
                />
              </div>
              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productData.sale_price}
                  onChange={(e) => setProductData(prev => ({ ...prev, sale_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productData.stock}
                  onChange={(e) => setProductData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddProduct} 
              disabled={loading || !productData.name || !productData.sale_price}
              className="w-full mt-3"
            >
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}