import { supabase } from '@/integrations/supabase/client';

export async function quickSeedProducts() {
  console.log('🚀 Quick seeding products...');
  
  try {
    // First check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ Products already exist');
      return { success: true, message: 'Products already exist' };
    }

    // Create a simple category first
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert([
        { name: 'General', description: 'Productos generales' }
      ], { onConflict: 'name' })
      .select()
      .single();

    if (categoryError) {
      console.error('❌ Category error:', categoryError);
      return { success: false, error: categoryError.message };
    }

    console.log('📁 Category created:', categoryData);

    // Create simple products
    const products = [
      {
        name: 'Paracetamol 500mg',
        sku: 'PAR500',
        barcode: '1234567890123',
        sale_price: 25.50,
        unit_type: 'unidad',
        requires_prescription: false,
        active: true,
        category_id: categoryData.id,
        location_id: null // Will be set to actual location ID after locations are created
      },
      {
        name: 'Ibuprofeno 400mg',
        sku: 'IBU400',
        barcode: '1234567890124',
        sale_price: 35.00,
        unit_type: 'unidad',
        requires_prescription: false,
        active: true,
        category_id: categoryData.id,
        location_id: null // Will be set to actual location ID after locations are created
      },
      {
        name: 'Aspirina 100mg',
        sku: 'ASP100',
        barcode: '1234567890125',
        sale_price: 15.75,
        unit_type: 'unidad',
        requires_prescription: false,
        active: true,
        category_id: categoryData.id,
        location_id: null // Will be set to actual location ID after locations are created
      }
    ];

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) {
      console.error('❌ Products error:', productsError);
      return { success: false, error: productsError.message };
    }

    console.log('✅ Products created:', insertedProducts);

    // Create a default location
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .upsert([
        { name: 'Almacén Principal', description: 'Ubicación principal' }
      ], { onConflict: 'name' })
      .select()
      .single();

    if (locationError) {
      console.error('❌ Location error:', locationError);
      return { success: false, error: locationError.message };
    }

    // Add inventory for each product
    const inventoryRecords = insertedProducts.map(product => ({
      product_id: product.id,
      location_id: locationData.id,
      current_stock: 100,
      min_stock: 10,
      max_stock: 500
    }));

    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryRecords);

    if (inventoryError) {
      console.error('❌ Inventory error:', inventoryError);
      return { success: false, error: inventoryError.message };
    }

    console.log('✅ Inventory created successfully');
    
    return { 
      success: true, 
      message: `Created ${insertedProducts.length} products with inventory`,
      data: insertedProducts
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}