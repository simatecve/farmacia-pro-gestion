import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWebhooks, type WebhookLog } from '@/hooks/useWebhooks';
import { Skeleton } from '@/components/ui/skeleton';

interface WebhookLogsProps {
  onClose: () => void;
}

export function WebhookLogs({ onClose }: WebhookLogsProps) {
  const { logs, webhooks, fetchLogs } = useWebhooks();
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchLogs();
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getWebhookName = (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    return webhook?.name || 'Webhook eliminado';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Logs de Webhooks</DialogTitle>
              <DialogDescription>
                Historial de llamadas realizadas a los webhooks configurados
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-[70vh]">
          {/* Lista de logs */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/50">
              <h3 className="font-medium">Historial de Llamadas</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded p-3">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                ) : logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No hay logs disponibles</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`border rounded p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedLog?.id === log.id ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.success)}
                          <Badge variant="outline" className="text-xs">
                            {log.event_type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {getWebhookName(log.webhook_id)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(log.success)}`}
                        >
                          {log.success ? 'Éxito' : 'Error'}
                        </Badge>
                        {log.response_status && (
                          <Badge variant="outline" className="text-xs">
                            {log.response_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Detalles del log seleccionado */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/50">
              <h3 className="font-medium">Detalles del Log</h3>
            </div>
            {selectedLog ? (
              <ScrollArea className="h-full p-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Webhook:</span>
                        <span>{getWebhookName(selectedLog.webhook_id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evento:</span>
                        <Badge variant="outline">{selectedLog.event_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha:</span>
                        <span>{new Date(selectedLog.sent_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedLog.success)}
                          <Badge className={getStatusColor(selectedLog.success)}>
                            {selectedLog.success ? 'Éxito' : 'Error'}
                          </Badge>
                        </div>
                      </div>
                      {selectedLog.response_status && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status HTTP:</span>
                          <Badge variant="outline">{selectedLog.response_status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Payload Enviado</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>

                  {selectedLog.response_body && (
                    <div>
                      <h4 className="font-medium mb-2">Respuesta del Servidor</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {selectedLog.response_body}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Selecciona un log para ver los detalles
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}