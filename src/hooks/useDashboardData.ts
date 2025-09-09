import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  sales: {
    today: number;
    todayChange: number;
    week: number[];
    recent: any[];
  };
  inventory: {
    totalProducts: number;
    lowStock: any[];
    expiringSoon: any[];
  };
  clients: {
    total: number;
    newThisWeek: number;
  };
  alerts: {
    total: number;
    lowStock: number;
    expiring: number;
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    sales: { today: 0, todayChange: 0, week: [], recent: [] },
    inventory: { totalProducts: 0, lowStock: [], expiringSoon: [] },
    clients: { total: 0, newThisWeek: 0 },
    alerts: { total: 0, lowStock: 0, expiring: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch sales data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [salesResponse, productsResponse, clientsResponse] = await Promise.all([
        // Sales for today and recent
        supabase
          .from('sales')
          .select(`
            *,
            sale_items(*)
          `)
          .gte('created_at', yesterday.toISOString().split('T')[0])
          .order('created_at', { ascending: false }),

        // Products and inventory
        supabase
          .from('products')
          .select(`
            *,
            inventory(*)
          `)
          .eq('active', true),

        // Clients
        supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (salesResponse.error) throw salesResponse.error;
      if (productsResponse.error) throw productsResponse.error;
      if (clientsResponse.error) throw clientsResponse.error;

      const sales = salesResponse.data || [];
      const products = productsResponse.data || [];
      const clients = clientsResponse.data || [];

      // Calculate sales metrics
      const todaySales = sales.filter(sale => 
        sale.created_at >= today.toISOString().split('T')[0]
      );
      const yesterdaysSales = sales.filter(sale => 
        sale.created_at >= yesterday.toISOString().split('T')[0] &&
        sale.created_at < today.toISOString().split('T')[0]
      );

      const todayTotal = todaySales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || '0')), 0);
      const yesterdayTotal = yesterdaysSales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || '0')), 0);
      const todayChange = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

      // Get week sales data (last 7 days)
      const weekSales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const daySales = sales.filter(sale => sale.created_at.startsWith(dateStr));
        const dayTotal = daySales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || '0')), 0);
        weekSales.push(dayTotal);
      }

      // Calculate inventory alerts
      const lowStockProducts = products.filter(product => {
        const totalStock = product.inventory?.reduce((sum: number, inv: any) => sum + (inv.current_stock || 0), 0) || 0;
        return totalStock <= product.min_stock && totalStock > 0;
      });

      const expiringSoonProducts = products.filter(product => {
        if (!product.expiry_date) return false;
        const expiryDate = new Date(product.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      });

      // Calculate client metrics
      const newClientsThisWeek = clients.filter(client => 
        new Date(client.created_at) >= weekAgo
      ).length;

      setData({
        sales: {
          today: todayTotal,
          todayChange,
          week: weekSales,
          recent: todaySales.slice(0, 5)
        },
        inventory: {
          totalProducts: products.length,
          lowStock: lowStockProducts.slice(0, 10),
          expiringSoon: expiringSoonProducts.slice(0, 10)
        },
        clients: {
          total: clients.length,
          newThisWeek: newClientsThisWeek
        },
        alerts: {
          total: lowStockProducts.length + expiringSoonProducts.length,
          lowStock: lowStockProducts.length,
          expiring: expiringSoonProducts.length
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboardData
  };
}