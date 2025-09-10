import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quickSeedProducts } from '@/utils/quickSeed';

export function ProductsDebug() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  const checkProducts = async () => {
    setLoading(true);
    try {
      // Check total products
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*');

      // Check active products
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);

      // Check inventory
      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('*');

      setResults({
        allProducts: {
          count: allProducts?.length || 0,
          data: allProducts,
          error: allError?.message
        },
        activeProducts: {
          count: activeProducts?.length || 0,
          data: activeProducts,
          error: activeError?.message
        },
        inventory: {
          count: inventory?.length || 0,
          data: inventory,
          error: invError?.message
        }
      });
    } catch (error) {
      console.error('Error checking products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await quickSeedProducts();
      setSeedResult(result);
      if (result.success) {
        // Refresh the products check
        await checkProducts();
      }
    } catch (error) {
      setSeedResult({ success: false, error: 'Error ejecutando seeding' });
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    checkProducts();
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔍 Diagnóstico de Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button onClick={checkProducts} disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar Productos'}
          </Button>
          <Button onClick={handleQuickSeed} disabled={seeding} variant="outline">
            {seeding ? 'Creando...' : 'Crear Productos de Prueba'}
          </Button>
        </div>
        
        {seedResult && (
           <div className={`p-3 rounded mb-4 ${
             seedResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
           }`}>
             <p className="font-semibold">
               {seedResult.success ? '✅ Éxito' : '❌ Error'}
             </p>
             <p>{seedResult.message || seedResult.error}</p>
           </div>
         )}
        
        {results && (
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-bold">📦 Todos los productos:</h3>
              <p>Cantidad: {results.allProducts.count}</p>
              {results.allProducts.error && (
                <p className="text-red-500">Error: {results.allProducts.error}</p>
              )}
              {results.allProducts.data && results.allProducts.data.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Primeros productos:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.allProducts.data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-bold">✅ Productos activos:</h3>
              <p>Cantidad: {results.activeProducts.count}</p>
              {results.activeProducts.error && (
                <p className="text-red-500">Error: {results.activeProducts.error}</p>
              )}
              {results.activeProducts.data && results.activeProducts.data.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Primeros productos activos:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.activeProducts.data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-bold">📊 Inventario:</h3>
              <p>Cantidad: {results.inventory.count}</p>
              {results.inventory.error && (
                <p className="text-red-500">Error: {results.inventory.error}</p>
              )}
              {results.inventory.data && results.inventory.data.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Primeros registros de inventario:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.inventory.data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}