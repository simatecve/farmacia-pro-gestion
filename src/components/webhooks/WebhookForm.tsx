import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useWebhooks, WEBHOOK_EVENTS, type WebhookSetting } from '@/hooks/useWebhooks';
import { useToast } from '@/hooks/use-toast';

interface WebhookFormProps {
  webhook?: WebhookSetting;
  onClose: () => void;
  onSuccess: () => void;
}

export function WebhookForm({ webhook, onClose, onSuccess }: WebhookFormProps) {
  const { createWebhook, updateWebhook } = useWebhooks();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    secret_key: webhook?.secret_key || '',
    active: webhook?.active ?? true,
  });

  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(webhook?.events || [])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "Nombre y URL son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (selectedEvents.size === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un evento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const webhookData = {
        ...formData,
        events: Array.from(selectedEvents),
      };

      let result;
      if (webhook) {
        result = await updateWebhook(webhook.id, webhookData);
      } else {
        result = await createWebhook(webhookData);
      }

      if (result.success) {
        toast({
          title: webhook ? "Webhook actualizado" : "Webhook creado",
          description: "Los cambios se han guardado correctamente",
        });
        onSuccess();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (event: string, checked: boolean) => {
    const newEvents = new Set(selectedEvents);
    if (checked) {
      newEvents.add(event);
    } else {
      newEvents.delete(event);
    }
    setSelectedEvents(newEvents);
  };

  const eventGroups = {
    'Productos': WEBHOOK_EVENTS.filter(e => e.startsWith('product.')),
    'Categorías': WEBHOOK_EVENTS.filter(e => e.startsWith('category.')),
    'Clientes': WEBHOOK_EVENTS.filter(e => e.startsWith('client.')),
    'Ventas': WEBHOOK_EVENTS.filter(e => e.startsWith('sale.')),
    'Inventario': WEBHOOK_EVENTS.filter(e => e.startsWith('inventory.')),
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {webhook ? 'Editar Webhook' : 'Nuevo Webhook'}
          </DialogTitle>
          <DialogDescription>
            {webhook ? 'Modifica la configuración del webhook' : 'Configura un nuevo webhook para recibir eventos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mi webhook"
                required
              />
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Activo</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL del Webhook</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://mi-servidor.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret_key">Clave Secreta (Opcional)</Label>
            <Input
              id="secret_key"
              type="password"
              value={formData.secret_key}
              onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
              placeholder="Clave para validar la autenticidad"
            />
            <p className="text-xs text-muted-foreground">
              Se enviará en el header X-Webhook-Secret
            </p>
          </div>

          <div className="space-y-4">
            <Label>Eventos a escuchar</Label>
            <div className="space-y-4">
              {Object.entries(eventGroups).map(([group, events]) => (
                <div key={group} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{group}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allSelected = events.every(e => selectedEvents.has(e));
                        events.forEach(event => {
                          if (allSelected) {
                            selectedEvents.delete(event);
                          } else {
                            selectedEvents.add(event);
                          }
                        });
                        setSelectedEvents(new Set(selectedEvents));
                      }}
                    >
                      {events.every(e => selectedEvents.has(e)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {events.map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Checkbox
                          id={event}
                          checked={selectedEvents.has(event)}
                          onCheckedChange={(checked) => handleEventChange(event, checked as boolean)}
                        />
                        <Label htmlFor={event} className="text-sm font-mono">
                          {event}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : webhook ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}