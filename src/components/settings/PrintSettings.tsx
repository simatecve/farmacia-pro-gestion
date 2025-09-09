import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

export function PrintSettings() {
  const { printSettings, updatePrintSettings, loading } = useSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    paper_width: 80,
    paper_type: 'thermal',
    print_logo: true,
    print_barcode: false,
    footer_text: '',
    copies: 1,
    auto_print: false
  });

  useEffect(() => {
    if (printSettings) {
      setFormData({
        paper_width: printSettings.paper_width || 80,
        paper_type: printSettings.paper_type || 'thermal',
        print_logo: printSettings.print_logo || false,
        print_barcode: printSettings.print_barcode || false,
        footer_text: printSettings.footer_text || '',
        copies: printSettings.copies || 1,
        auto_print: printSettings.auto_print || false
      });
    }
  }, [printSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePrintSettings(formData);
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de impresión se ha actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de impresión",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
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
          <Printer className="h-5 w-5" />
          Configuración de Impresión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paper_width">Ancho del Papel (mm)</Label>
              <Select 
                value={formData.paper_width.toString()} 
                onValueChange={(value) => updateField('paper_width', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58">58mm</SelectItem>
                  <SelectItem value="80">80mm</SelectItem>
                  <SelectItem value="112">112mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paper_type">Tipo de Papel</Label>
              <Select value={formData.paper_type} onValueChange={(value) => updateField('paper_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Térmico</SelectItem>
                  <SelectItem value="impact">Matricial</SelectItem>
                  <SelectItem value="inkjet">Inyección de Tinta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="copies">Número de Copias</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                max="5"
                value={formData.copies}
                onChange={(e) => updateField('copies', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="print_logo"
                checked={formData.print_logo}
                onCheckedChange={(checked) => updateField('print_logo', checked)}
              />
              <Label htmlFor="print_logo">Imprimir logo de la empresa</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="print_barcode"
                checked={formData.print_barcode}
                onCheckedChange={(checked) => updateField('print_barcode', checked)}
              />
              <Label htmlFor="print_barcode">Imprimir código de barras del ticket</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_print"
                checked={formData.auto_print}
                onCheckedChange={(checked) => updateField('auto_print', checked)}
              />
              <Label htmlFor="auto_print">Impresión automática al completar venta</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="footer_text">Texto del Pie de Página</Label>
            <Textarea
              id="footer_text"
              value={formData.footer_text}
              onChange={(e) => updateField('footer_text', e.target.value)}
              placeholder="Mensaje que aparecerá al final del ticket..."
              rows={3}
            />
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