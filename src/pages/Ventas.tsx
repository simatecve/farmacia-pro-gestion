import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesHistoryTable } from "@/components/sales/SalesHistoryTable";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesStats } from "@/components/sales/SalesStats";
import { useSales } from "@/hooks/useSales";
import { isToday, isYesterday, isThisWeek, isThisMonth, isThisQuarter, isThisYear } from "date-fns";

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  
  const { sales, loading, fetchSales } = useSales();

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      // Search filter
      const matchesSearch = searchTerm === "" || (
        sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Status filter
      const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
      
      // Payment method filter
      const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
      
      // Date range filter
      let matchesDateRange = true;
      switch (dateRangeFilter) {
        case "today":
          matchesDateRange = isToday(saleDate);
          break;
        case "yesterday":
          matchesDateRange = isYesterday(saleDate);
          break;
        case "week":
          matchesDateRange = isThisWeek(saleDate);
          break;
        case "month":
          matchesDateRange = isThisMonth(saleDate);
          break;
        case "quarter":
          matchesDateRange = isThisQuarter(saleDate);
          break;
        case "year":
          matchesDateRange = isThisYear(saleDate);
          break;
        default:
          matchesDateRange = true;
      }
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDateRange;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter, dateRangeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRangeFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-accent rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-accent rounded mb-6"></div>
          <div className="h-64 bg-accent rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historial de Ventas</h1>
        <p className="text-muted-foreground">Administra y visualiza todas las ventas realizadas</p>
      </div>

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        paymentFilter={paymentFilter}
        onPaymentChange={setPaymentFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeChange={setDateRangeFilter}
        onClearFilters={clearFilters}
      />

      {/* Stats */}
      <SalesStats sales={sales} filteredSales={filteredSales} />

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesHistoryTable sales={filteredSales} onRefresh={fetchSales} />
        </CardContent>
      </Card>
    </div>
  );
}