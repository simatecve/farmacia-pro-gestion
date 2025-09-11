import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  // Estados del formulario
  const [formData, setFormData] = useState({
     name: '',
     description: '',
     sku: '',
     barcode: '',
     code: '',
     category_id: 'none',
     unit_type: 'unidad',
     presentation: '',
     concentration: '',
     laboratory: '',
     location_id: 'none',
     expiry_date: '',
     sale_price: 0,
     purchase_price: 0,
     min_stock: 0,
     max_stock: 0,
     requires_prescription: false,
     active: true
   });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { createProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { toast } = useToast();

  // Inicializar datos del producto si existe
  useEffect(() => {
    if (product) {
      setFormData({
         name: product.name || '',
         description: product.description || '',
         sku: product.sku || '',
         barcode: product.barcode || '',
         code: product.code || '',
         category_id: product.category_id || 'none',
         unit_type: product.unit_type || 'unidad',
         presentation: product.presentation || '',
         concentration: product.concentration || '',
         laboratory: product.laboratory || '',
         location_id: product.location_id || 'none',
         expiry_date: product.expiry_date || '',
         sale_price: product.sale_price || 0,
         purchase_price: product.purchase_price || 0,
         min_stock: product.min_stock || 0,
         max_stock: product.max_stock || 0,
         requires_prescription: product.requires_prescription || false,
         active: product.active ?? true
       });
      setImagePreview(product.image_url || null);
    }
  }, [product]);

  // Manejo de errores de ubicaciones
  useEffect(() => {
    if (locationsError) {
      console.error('Error loading locations:', locationsError);
      setError('Error al cargar las ubicaciones');
    }
  }, [locationsError]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor seleccione un archivo de imagen válido",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      console.log('Starting form submission with data:', formData);
      
      let imageUrl = imagePreview;
      
      if (imageFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage();
        if (!imageUrl) {
          console.error('Image upload failed');
          setSaving(false);
          return;
        }
        console.log('Image uploaded successfully:', imageUrl);
      }

      const productData = {
         ...formData,
         location_id: formData.location_id === 'none' ? null : formData.location_id,
         category_id: formData.category_id === 'none' ? null : formData.category_id,
         image_url: imageUrl
       };

      console.log('Final product data to save:', productData);

      if (product) {
        console.log('Updating product:', product.id);
        await updateProduct(product.id, productData);
        console.log('Product updated successfully');
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente"
        });
      } else {
        console.log('Creating new product...');
        await createProduct(productData);
        console.log('Product created successfully');
        toast({
          title: "Éxito",
          description: "Producto creado correctamente"
        });
        
        // Limpiar formulario
         setFormData({
           name: '',
           description: '',
           sku: '',
           barcode: '',
           code: '',
           category_id: 'none',
           unit_type: 'unidad',
           presentation: '',
           concentration: '',
           laboratory: '',
           location_id: 'none',
           expiry_date: '',
           sale_price: 0,
           purchase_price: 0,
           min_stock: 0,
           max_stock: 0,
           requires_prescription: false,
           active: true
         });
        setImageFile(null);
        setImagePreview(null);
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el producto';
      console.error('Processed error message:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Mostrar error si existe
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error en el formulario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => setError(null)} variant="outline">
              Reintentar
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                Cerrar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product ? 'Editar Producto' : 'Nuevo Producto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen del producto */}
          <div>
            <Label>Imagen del Producto</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-6 h-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <label htmlFor="image-upload" className="cursor-pointer text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground">Subir imagen</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
                placeholder="Código del producto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="SKU del producto"
              />
            </div>
            
            <div>
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => updateField('barcode', e.target.value)}
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          {/* Categoría y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ubicación</Label>
              <Select value={formData.location_id} onValueChange={(value) => updateField('location_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={locationsLoading ? "Cargando ubicaciones..." : "Seleccionar ubicación"} />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="none">Sin ubicación</SelectItem>
                   {locationsError ? (
                     <SelectItem value="error" disabled>
                       Error cargando ubicaciones
                     </SelectItem>
                   ) : (
                     locations?.map((location) => (
                       <SelectItem key={location.id} value={location.id}>
                         {location.name}
                       </SelectItem>
                     ))
                   )}
                 </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Categoría</Label>
              <Select value={formData.category_id} onValueChange={(value) => updateField('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="none">Sin categoría</SelectItem>
                   {categories.map((category) => (
                     <SelectItem key={category.id} value={category.id}>
                       {category.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_price">Precio de Compra</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => updateField('purchase_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="sale_price">Precio de Venta</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => updateField('sale_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_stock">Stock Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => updateField('min_stock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="max_stock">Stock Máximo</Label>
              <Input
                id="max_stock"
                type="number"
                min="0"
                value={formData.max_stock}
                onChange={(e) => updateField('max_stock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Configuraciones adicionales */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requires_prescription"
                checked={formData.requires_prescription}
                onCheckedChange={(checked) => updateField('requires_prescription', checked)}
              />
              <Label htmlFor="requires_prescription">Requiere Receta</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
              <Label htmlFor="active">Activo</Label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={saving || uploading}
            >
              {saving ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}