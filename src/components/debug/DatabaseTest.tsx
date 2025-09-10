import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { seedTestData } from '@/utils/seedData';
import { QuickProductManager } from '@/components/admin/QuickProductManager';
import { ProductsDebug } from './ProductsDebug';

export function DatabaseTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check connection
      console.log('🔗 Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      results.push({
        test: 'Connection Test',
        success: !connectionError,
        data: connectionTest,
        error: connectionError?.message
      });

      // Test 2: Check products table
      console.log('📦 Testing products table...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(10);
      
      results.push({
        test: 'Products Table',
        success: !productsError,
        data: products,
        error: productsError?.message,
        count: products?.length || 0
      });

      // Test 2.1: Check active products specifically
      console.log('✅ Testing active products...');
      const { data: activeProducts, error: activeProductsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);
      
      results.push({
        test: 'Active Products',
        success: !activeProductsError,
        data: activeProducts,
        error: activeProductsError?.message,
        count: activeProducts?.length || 0
      });

      // Test 3: Check inventory table
      console.log('📊 Testing inventory table...');
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(10);
      
      results.push({
        test: 'Inventory Table',
        success: !inventoryError,
        data: inventory,
        error: inventoryError?.message,
        count: inventory?.length || 0
      });

      // Test 4: Check the join query used in useProductsWithStock
      console.log('🔄 Testing join query...');
      const { data: joinData, error: joinError } = await supabase
        .from('inventory')
        .select(`
          current_stock,
          product:products!inner(
            id,
            name,
            sku,
            barcode,
            sale_price,
            unit_type,
            requires_prescription,
            active
          )
        `)
        .eq('product.active', true)
        .limit(10);
      
      results.push({
        test: 'Join Query (useProductsWithStock)',
        success: !joinError,
        data: joinData,
        error: joinError?.message,
        count: joinData?.length || 0
      });

    } catch (error) {
      results.push({
        test: 'General Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setLoading(false);
    console.log('🧪 All test results:', results);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    const result = await seedTestData();
    setSeedResult(result);
    setSeeding(false);
    
    // Run tests again after seeding
    if (result.success) {
      await runTests();
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <ProductsDebug />
      <QuickProductManager />
      
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Tests Again'}
            </Button>
            <Button onClick={handleSeedData} disabled={seeding} variant="outline">
              {seeding ? 'Seeding Data...' : 'Seed Test Data'}
            </Button>
          </div>
          
          {seedResult && (
            <div className={`p-4 rounded border mb-4 ${
              seedResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}>
              <h3 className="font-semibold">Data Seeding Result</h3>
              <p className={seedResult.success ? 'text-green-700' : 'text-red-700'}>
                {seedResult.success ? '✅ Data seeded successfully!' : `❌ Seeding failed: ${seedResult.error}`}
              </p>
            </div>
          )}
          
          <div className="mt-4 space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 rounded border ${
                result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold">{result.test}</h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </p>
                {result.count !== undefined && (
                  <p>Records found: {result.count}</p>
                )}
                {result.error && (
                  <p className="text-red-600 text-sm mt-2">Error: {result.error}</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      Show data (click to expand)
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}