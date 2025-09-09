import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, TestTube, Eye, Trash2, ExternalLink } from 'lucide-react';
import { useWebhooks, WEBHOOK_EVENTS } from '@/hooks/useWebhooks';
import { WebhookForm } from './WebhookForm';
import { WebhookLogs } from './WebhookLogs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function WebhookSettings() {
  const { webhooks, loading, error, updateWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const handleToggleActive = async (id: string, active: boolean) => {
    const result = await updateWebhook(id, { active });
    if (result.success) {
      toast({
        title: active ? "Webhook activado" : "Webhook desactivado",
        description: "El estado del webhook se ha actualizado",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleTestWebhook = async (webhook: any) => {
    setTestingWebhook(webhook.id);
    const result = await testWebhook(webhook);
    
    if (result.success) {
      toast({
        title: "Webhook probado",
        description: `Respuesta: ${result.status}`,
      });
    } else {
      toast({
        title: "Error en el test",
        description: result.error,
        variant: "destructive",
      });
    }
    setTestingWebhook(null);
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este webhook?')) return;
    
    const result = await deleteWebhook(id);
    if (result.success) {
      toast({
        title: "Webhook eliminado",
        description: "El webhook se ha eliminado correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuración de Webhooks</CardTitle>
              <CardDescription>
                Configura webhooks para recibir notificaciones en tiempo real de eventos del sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowLogs(true)}
                variant="outline"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Logs
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Webhook
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay webhooks configurados</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer webhook
                </Button>
              </div>
            ) : (
              webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {webhook.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={(checked) => handleToggleActive(webhook.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={testingWebhook === webhook.id}
                      >
                        <TestTube className="w-4 h-4" />
                        {testingWebhook === webhook.id ? 'Probando...' : 'Probar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowForm(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Estado: {webhook.active ? 'Activo' : 'Inactivo'}</span>
                    <span>Eventos: {webhook.events.length}</span>
                    <span>Creado: {new Date(webhook.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Events Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Disponibles</CardTitle>
          <CardDescription>
            Eventos que pueden ser capturados por los webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <Badge key={event} variant="outline" className="justify-center">
                {event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <WebhookForm
          webhook={selectedWebhook}
          onClose={() => {
            setShowForm(false);
            setSelectedWebhook(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedWebhook(null);
          }}
        />
      )}

      {showLogs && (
        <WebhookLogs
          onClose={() => setShowLogs(false)}
        />
      )}
    </div>
  );
}