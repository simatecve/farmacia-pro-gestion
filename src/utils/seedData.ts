import { supabase } from '@/integrations/supabase/client';

export async function seedTestData() {
  console.log('🌱 Starting data seeding...');
  
  try {
    // First, let's check if we can connect
    const { data: testConnection, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return { success: false, error: connectionError.message };
    }
    
    console.log('✅ Connection successful');
    
    // Check if categories exist, if not create them
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*');
    
    if (!existingCategories || existingCategories.length === 0) {
      console.log('📁 Creating categories...');
      const { error: categoryError } = await supabase
        .from('categories')
        .insert([
          { name: 'Medicamentos', description: 'Productos farmacéuticos' },
          { name: 'Cuidado Personal', description: 'Productos de higiene y cuidado' },
          { name: 'Vitaminas', description: 'Suplementos vitamínicos' },
          { name: 'Primeros Auxilios', description: 'Productos para primeros auxilios' }
        ]);
      
      if (categoryError) {
        console.error('❌ Error creating categories:', categoryError);
        return { success: false, error: categoryError.message };
      }
    }
    
    // Get category IDs
    const { data: categories } = await supabase
      .from('categories')
      .select('*');
    
    const medicamentosCategory = categories?.find(c => c.name === 'Medicamentos');
    const vitaminasCategory = categories?.find(c => c.name === 'Vitaminas');
    const cuidadoCategory = categories?.find(c => c.name === 'Cuidado Personal');
    const primerosAuxiliosCategory = categories?.find(c => c.name === 'Primeros Auxilios');
    
    // Check if products exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('*');
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log('📦 Creating products...');
      const { data: newProducts, error: productError } = await supabase
        .from('products')
        .insert([
          {
            name: 'Ibuprofeno 400mg',
            description: 'Antiinflamatorio y analgésico',
            sku: 'IBU400',
            barcode: '7501234567890',
            sale_price: 12.50,
            purchase_price: 8.00,
            min_stock: 10,
            max_stock: 100,
            unit_type: 'unidad',
            presentation: 'Tabletas',
            concentration: '400mg',
            laboratory: 'Laboratorio ABC',
            active: true,
            requires_prescription: false,
            category_id: medicamentosCategory?.id
          },
          {
            name: 'Paracetamol 500mg',
            description: 'Analgésico y antipirético',
            sku: 'PAR500',
            barcode: '7501234567891',
            sale_price: 8.75,
            purchase_price: 5.50,
            min_stock: 15,
            max_stock: 150,
            unit_type: 'unidad',
            presentation: 'Tabletas',
            concentration: '500mg',
            laboratory: 'Laboratorio XYZ',
            active: true,
            requires_prescription: false,
            category_id: medicamentosCategory?.id
          },
          {
            name: 'Vitamina C 1000mg',
            description: 'Suplemento vitamínico',
            sku: 'VITC1000',
            barcode: '7501234567892',
            sale_price: 25.00,
            purchase_price: 18.00,
            min_stock: 5,
            max_stock: 50,
            unit_type: 'unidad',
            presentation: 'Tabletas',
            concentration: '1000mg',
            laboratory: 'Vitaminas Plus',
            active: true,
            requires_prescription: false,
            category_id: vitaminasCategory?.id
          },
          {
            name: 'Alcohol 70%',
            description: 'Antiséptico',
            sku: 'ALC70',
            barcode: '7501234567893',
            sale_price: 15.00,
            purchase_price: 10.00,
            min_stock: 20,
            max_stock: 200,
            unit_type: 'unidad',
            presentation: 'Frasco 250ml',
            concentration: '70%',
            laboratory: 'Antisépticos SA',
            active: true,
            requires_prescription: false,
            category_id: primerosAuxiliosCategory?.id
          },
          {
            name: 'Shampoo Anticaspa',
            description: 'Cuidado capilar',
            sku: 'SHA001',
            barcode: '7501234567894',
            sale_price: 35.50,
            purchase_price: 25.00,
            min_stock: 8,
            max_stock: 80,
            unit_type: 'unidad',
            presentation: 'Frasco 400ml',
            concentration: 'N/A',
            laboratory: 'Cuidado Total',
            active: true,
            requires_prescription: false,
            category_id: cuidadoCategory?.id
          }
        ])
        .select();
      
      if (productError) {
        console.error('❌ Error creating products:', productError);
        return { success: false, error: productError.message };
      }
      
      console.log('✅ Products created:', newProducts);
      
      // Create default location if it doesn't exist
      const { data: existingLocations } = await supabase
        .from('locations')
        .select('*');
      
      let defaultLocation;
      if (!existingLocations || existingLocations.length === 0) {
        console.log('📍 Creating default location...');
        const { data: newLocation, error: locationError } = await supabase
          .from('locations')
          .insert([{ name: 'Farmacia Principal', description: 'Ubicación principal de la farmacia' }])
          .select()
          .single();
        
        if (locationError) {
          console.error('❌ Error creating location:', locationError);
          return { success: false, error: locationError.message };
        }
        
        defaultLocation = newLocation;
      } else {
        defaultLocation = existingLocations[0];
      }
      
      // Create inventory for products
      if (newProducts && defaultLocation) {
        console.log('📊 Creating inventory...');
        const inventoryData = newProducts.map(product => ({
          product_id: product.id,
          location_id: defaultLocation.id,
          current_stock: 50
        }));
        
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert(inventoryData);
        
        if (inventoryError) {
          console.error('❌ Error creating inventory:', inventoryError);
          return { success: false, error: inventoryError.message };
        }
        
        console.log('✅ Inventory created');
      }
    }
    
    console.log('🎉 Data seeding completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('💥 Unexpected error during seeding:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}