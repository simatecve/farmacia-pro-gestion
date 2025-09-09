import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebhookSetting {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret_key?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status?: number;
  response_body?: string;
  sent_at: string;
  success: boolean;
}

export const WEBHOOK_EVENTS = [
  'product.created',
  'product.updated',
  'product.deleted',
  'category.created',
  'category.updated',
  'category.deleted',
  'client.created',
  'client.updated',
  'client.deleted',
  'sale.created',
  'sale.updated',
  'inventory.movement',
] as const;

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookSetting[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (webhookId?: string) => {
    try {
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (webhookId) {
        query = query.eq('webhook_id', webhookId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
    }
  };

  const createWebhook = async (webhookData: Omit<WebhookSetting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('webhook_settings')
        .insert([webhookData]);

      if (error) throw error;
      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al crear webhook' 
      };
    }
  };

  const updateWebhook = async (id: string, webhookData: Partial<WebhookSetting>) => {
    try {
      const { error } = await supabase
        .from('webhook_settings')
        .update(webhookData)
        .eq('id', id);

      if (error) throw error;
      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al actualizar webhook' 
      };
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al eliminar webhook' 
      };
    }
  };

  const testWebhook = async (webhook: WebhookSetting) => {
    try {
      const testPayload = {
        event_type: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { message: 'Test webhook from Daalef Farmacia' }
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret_key && { 'X-Webhook-Secret': webhook.secret_key })
        },
        body: JSON.stringify(testPayload)
      });

      // Log the test
      await supabase
        .from('webhook_logs')
        .insert([{
          webhook_id: webhook.id,
          event_type: 'webhook.test',
          payload: testPayload,
          response_status: response.status,
          response_body: await response.text(),
          success: response.ok
        }]);

      await fetchLogs();
      return { success: response.ok, status: response.status };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al probar webhook' 
      };
    }
  };

  const triggerWebhook = async (eventType: string, data: any) => {
    try {
      const activeWebhooks = webhooks.filter(w => 
        w.active && w.events.includes(eventType)
      );

      for (const webhook of activeWebhooks) {
        try {
          const payload = {
            event_type: eventType,
            timestamp: new Date().toISOString(),
            data
          };

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(webhook.secret_key && { 'X-Webhook-Secret': webhook.secret_key })
            },
            body: JSON.stringify(payload)
          });

          // Log the webhook call
          await supabase
            .from('webhook_logs')
            .insert([{
              webhook_id: webhook.id,
              event_type: eventType,
              payload,
              response_status: response.status,
              response_body: await response.text(),
              success: response.ok
            }]);

        } catch (err) {
          console.error(`Error calling webhook ${webhook.name}:`, err);
          
          // Log the error
          await supabase
            .from('webhook_logs')
            .insert([{
              webhook_id: webhook.id,
              event_type: eventType,
              payload: { event_type: eventType, data },
              response_body: err instanceof Error ? err.message : 'Unknown error',
              success: false
            }]);
        }
      }
    } catch (err) {
      console.error('Error triggering webhooks:', err);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  return {
    webhooks,
    logs,
    loading,
    error,
    fetchWebhooks,
    fetchLogs,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    triggerWebhook,
  };
}