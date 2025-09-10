import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocations } from '@/hooks/useLocations';
import { useCategories } from '@/hooks/useCategories';

export function ProductFormTest() {
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prueba de Hooks - ProductForm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Ubicaciones:</h3>
            <p>Cargando: {locationsLoading ? 'Sí' : 'No'}</p>
            <p>Error: {locationsError || 'Ninguno'}</p>
            <p>Cantidad: {locations?.length || 0}</p>
            {locations?.length > 0 && (
              <ul className="list-disc list-inside">
                {locations.slice(0, 3).map(loc => (
                  <li key={loc.id}>{loc.name}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">Categorías:</h3>
            <p>Cargando: {categoriesLoading ? 'Sí' : 'No'}</p>
            <p>Error: {categoriesError || 'Ninguno'}</p>
            <p>Cantidad: {categories?.length || 0}</p>
            {categories?.length > 0 && (
              <ul className="list-disc list-inside">
                {categories.slice(0, 3).map(cat => (
                  <li key={cat.id}>{cat.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}