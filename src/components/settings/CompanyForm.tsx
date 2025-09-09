import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompanySettings, useSettings } from "@/hooks/useSettings";

export function CompanyForm() {
  const { companySettings, updateCompanySettings, loading } = useSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    currency: 'MXN',
    currency_symbol: '$',
    timezone: 'America/Mexico_City'
  });

  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || '',
        legal_name: companySettings.legal_name || '',
        tax_id: companySettings.tax_id || '',
        address: companySettings.address || '',
        phone: companySettings.phone || '',
        email: companySettings.email || '',
        website: companySettings.website || '',
        currency: companySettings.currency || 'MXN',
        currency_symbol: companySettings.currency_symbol || '$',
        timezone: companySettings.timezone || 'America/Mexico_City'
      });
    }
  }, [companySettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCompanySettings(formData);
      
      toast({
        title: "Configuración guardada",
        description: "Los datos de la empresa se han actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Datos de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Comercial *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nombre de la farmacia"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="legal_name">Razón Social</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => updateField('legal_name', e.target.value)}
                placeholder="Razón social legal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_id">RFC</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => updateField('tax_id', e.target.value)}
                placeholder="RFC de la empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="correo@farmacia.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://farmacia.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Dirección completa de la farmacia"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency_symbol">Símbolo</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol}
                onChange={(e) => updateField('currency_symbol', e.target.value)}
                placeholder="$"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select value={formData.timezone} onValueChange={(value) => updateField('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                  <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
                  <SelectItem value="America/Cancun">Cancún (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}