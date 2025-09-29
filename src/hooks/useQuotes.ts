import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuoteItem {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface Quote {
  id?: string;
  quote_number: string;
  client_id?: string;
  client_name?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  status: string;
  notes?: string;
  valid_until?: string;
  created_at: string;
  items?: QuoteItem[];
}

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuotes = async (limit = 50) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (name),
          quote_items (
            *,
            products (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedQuotes = (data as any)?.map((quote: any) => ({
        ...quote,
        client_name: quote.clients?.name || 'CONSUMIDOR FINAL',
        items: quote.quote_items?.map((item: any) => ({
          ...item,
          product_name: item.products?.name
        }))
      })) || [];

      setQuotes(formattedQuotes);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'created_at' | 'quote_number'>, items: QuoteItem[]) => {
    setLoading(true);
    try {
      // Generate quote number
      const { data: quoteNumberData } = await supabase
        .rpc('generate_quote_number');
      
      const quote_number = quoteNumberData || `PRES-${Date.now()}`;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          ...quoteData,
          quote_number
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const quoteItems = items.map(item => ({
        quote_id: quote.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Éxito",
        description: "Presupuesto creado correctamente"
      });

      await fetchQuotes();
      return quote;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente"
      });

      await fetchQuotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return {
    quotes,
    loading,
    createQuote,
    updateQuoteStatus,
    fetchQuotes
  };
};
