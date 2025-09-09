import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Ubicaciones from "./pages/Ubicaciones";
import Inventario from "./pages/Inventario";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import Ventas from "./pages/Ventas";
import Compras from "./pages/Compras";
import Reportes from "./pages/Reportes";
import Fidelizacion from "./pages/Fidelizacion";
import GestionClientes from "./pages/GestionClientes";
import Campanias from "./pages/Campanias";
import Recordatorios from "./pages/Recordatorios";
import CashRegister from "./pages/CashRegister";
import Auditoria from "./pages/Auditoria";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout><Index /></MainLayout>} />
            <Route path="/productos" element={<MainLayout><Productos /></MainLayout>} />
            <Route path="/categorias" element={<MainLayout><Categorias /></MainLayout>} />
            <Route path="/ubicaciones" element={<MainLayout><Ubicaciones /></MainLayout>} />
            <Route path="/inventario" element={<MainLayout><Inventario /></MainLayout>} />
            <Route path="/clientes" element={<MainLayout><Clientes /></MainLayout>} />
            <Route path="/proveedores" element={<MainLayout><Proveedores /></MainLayout>} />
            <Route path="/ventas" element={<MainLayout><Ventas /></MainLayout>} />
            <Route path="/compras" element={<MainLayout><Compras /></MainLayout>} />
            <Route path="/reportes" element={<MainLayout><Reportes /></MainLayout>} />
            <Route path="/fidelizacion" element={<MainLayout><Fidelizacion /></MainLayout>} />
            <Route path="/gestion-clientes" element={<MainLayout><GestionClientes /></MainLayout>} />
            <Route path="/campanias" element={<MainLayout><Campanias /></MainLayout>} />
            <Route path="/recordatorios" element={<MainLayout><Recordatorios /></MainLayout>} />
            <Route path="/caja" element={<MainLayout><CashRegister /></MainLayout>} />
            <Route path="/auditoria" element={<MainLayout><Auditoria /></MainLayout>} />
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
