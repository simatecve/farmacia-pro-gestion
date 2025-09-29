import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteCheckoutProps {
  onGenerateQuote: (data: { notes: string; valid_until: string }) => void;
  loading: boolean;
}

export const QuoteCheckout = ({ onGenerateQuote, loading }: QuoteCheckoutProps) => {
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState<Date>();

  const handleGenerate = () => {
    onGenerateQuote({
      notes,
      valid_until: validUntil ? format(validUntil, "yyyy-MM-dd") : ""
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg">Detalles del Presupuesto</h3>
      
      <div className="space-y-2">
        <Label>Válido hasta</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !validUntil && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {validUntil ? format(validUntil, "PPP") : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={validUntil}
              onSelect={setValidUntil}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea
          placeholder="Observaciones adicionales..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <Button 
        className="w-full" 
        onClick={handleGenerate}
        disabled={loading}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Generar Presupuesto PDF
      </Button>
    </Card>
  );
};
