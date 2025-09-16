import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, User, Plus, Phone, Mail, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClientForm } from '@/components/crm/ClientForm';
import { useClients } from '@/hooks/useClients';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  identification_number?: string;
  address?: string;
  loyalty_points: number;
  total_purchases: number;
}

export interface ClientSearchProps {
  onClientSelect?: (client: Client) => void;
  onSearchChange?: (searchTerm: string, results: Client[]) => void;
  placeholder?: string;
  showResults?: boolean;
  maxResults?: number;
  className?: string;
  selectedClientId?: string;
  value?: string;
  showAddNew?: boolean;
}

export function ClientSearch({
  onClientSelect,
  onSearchChange,
  placeholder = "Buscar cliente por nombre, email, teléfono, cédula...",
  showResults = true,
  maxResults = 10,
  className = "",
  selectedClientId,
  value,
  showAddNew = true
}: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  
  const { refreshClients } = useClients();

  // Realizar búsqueda en la base de datos
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      onSearchChange?.(term, []);
      return;
    }

    setIsSearching(true);
    
    try {
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,identification_number.ilike.%${term}%,address.ilike.%${term}%`)
        .limit(maxResults);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedClients: Client[] = (clients || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        identification_number: client.identification_number,
        address: client.address,
        loyalty_points: client.loyalty_points || 0,
        total_purchases: client.total_purchases || 0
      }));

      setSearchResults(formattedClients);
      setSelectedIndex(-1);
      onSearchChange?.(term, formattedClients);
      
    } catch (error) {
      console.error('Error searching clients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar clientes: ${errorMessage}`);
      setSearchResults([]);
      onSearchChange?.(term, []);
    } finally {
      setIsSearching(false);
    }
  }, [maxResults, onSearchChange]);

  // Cargar cliente seleccionado
  useEffect(() => {
    if (selectedClientId && !searchTerm) {
      const loadSelectedClient = async () => {
        try {
          const { data: client, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', selectedClientId)
            .single();

          if (error) throw error;

          if (client) {
            setSearchTerm(client.name);
          }
        } catch (error) {
          console.error('Error loading selected client:', error);
        }
      };

      loadSelectedClient();
    }
  }, [selectedClientId]);

  // Sincronizar con valor externo
  useEffect(() => {
    if (value !== undefined && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Manejar teclas de navegación
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleClientSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setSearchResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Manejar selección de cliente
  const handleClientSelect = (client: Client) => {
    onClientSelect?.(client);
    setSearchTerm(client.name);
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedIndex(-1);
    onSearchChange?.('', []);
  };

  // Manejar creación de nuevo cliente
  const handleNewClientSuccess = (newClient?: Client) => {
    setShowNewClientDialog(false);
    refreshClients();
    toast.success('Cliente creado exitosamente');
    
    // Si se proporciona el nuevo cliente, seleccionarlo automáticamente
    if (newClient) {
      handleClientSelect(newClient);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showAddNew && (
            <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Agregar nuevo cliente"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <ClientForm onSuccess={handleNewClientSuccess} />
              </DialogContent>
            </Dialog>
          )}
          
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.map((client, index) => (
              <div
                key={client.id}
                className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                  index === selectedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{client.name}</span>
                      {client.loyalty_points > 1000 && (
                        <Badge variant="default" className="text-xs">
                          VIP
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {client.identification_number && client.identification_number !== '0000000' && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {client.identification_number}
                        </span>
                      )}
                      {client.phone && client.phone !== '0000000' && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                      )}
                    </div>
                    {client.address && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {client.address}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{client.loyalty_points} pts</div>
                    <div className="text-xs text-muted-foreground">
                      ${client.total_purchases.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}