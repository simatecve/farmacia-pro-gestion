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
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block text-muted-foreground uppercase tracking-wide">
          Válido hasta
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11",
                !validUntil && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {validUntil ? format(validUntil, "dd/MM/yyyy") : "Seleccionar fecha de vencimiento"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={validUntil}
              onSelect={setValidUntil}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-muted-foreground uppercase tracking-wide">
          Notas y Condiciones
        </label>
        <Textarea
          placeholder="Términos de pago, condiciones especiales, observaciones..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="resize-none"
        />
      </div>

      <Button 
        className="w-full h-11" 
        onClick={handleGenerate}
        disabled={loading}
        size="lg"
      >
        <FileDown className="mr-2 h-5 w-5" />
        {loading ? "Generando..." : "Generar Presupuesto PDF"}
      </Button>
    </div>
  );
};
