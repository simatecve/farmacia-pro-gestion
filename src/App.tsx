import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import Index from "./pages/Index";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Ubicaciones from "./pages/Ubicaciones";
import Inventario from "./pages/Inventario";
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
            <Route path="/" element={
              <AuthenticatedLayout>
                <Index />
              </AuthenticatedLayout>
            } />
            <Route path="/productos" element={
              <AuthenticatedLayout>
                <Productos />
              </AuthenticatedLayout>
            } />
            <Route path="/categorias" element={
              <AuthenticatedLayout>
                <Categorias />
              </AuthenticatedLayout>
            } />
            <Route path="/ubicaciones" element={
              <AuthenticatedLayout>
                <Ubicaciones />
              </AuthenticatedLayout>
            } />
            <Route path="/inventario" element={
              <AuthenticatedLayout>
                <Inventario />
              </AuthenticatedLayout>
            } />
            <Route path="*" element={
              <AuthenticatedLayout>
                <NotFound />
              </AuthenticatedLayout>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
