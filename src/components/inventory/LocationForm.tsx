import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocations, type Location } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';

interface LocationFormProps {
  location?: Location;
  onSave?: () => void;
  onCancel?: () => void;
}

export function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [name, setName] = useState(location?.name || '');
  const [description, setDescription] = useState(location?.description || '');
  const [saving, setSaving] = useState(false);
  const { createLocation, updateLocation } = useLocations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la ubicación es obligatorio",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (location) {
        await updateLocation(location.id, { name, description });
        toast({
          title: "Éxito",
          description: "Ubicación actualizada correctamente"
        });
      } else {
        await createLocation({ name, description });
        toast({
          title: "Éxito",
          description: "Ubicación creada correctamente"
        });
        setName('');
        setDescription('');
      }
      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error procesando ubicación",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {location ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la ubicación"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la ubicación"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : (location ? 'Actualizar' : 'Crear')}
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