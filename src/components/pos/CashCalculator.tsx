import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign } from "lucide-react";

interface CashCalculatorProps {
  total: number;
  onAmountChange: (amountPaid: number, change: number) => void;
}

export function CashCalculator({ total, onAmountChange }: CashCalculatorProps) {
  const [amountPaid, setAmountPaid] = useState("");
  const [calculatorDisplay, setCalculatorDisplay] = useState("");

  const calculatorButtons = [
    ['7', '8', '9', 'C'],
    ['4', '5', '6', '⌫'],
    ['1', '2', '3', '0'],
    ['.', '00', 'OK']
  ];

  const handleCalculatorClick = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay("");
      setAmountPaid("");
      onAmountChange(0, 0);
    } else if (value === '⌫') {
      const newDisplay = calculatorDisplay.slice(0, -1);
      setCalculatorDisplay(newDisplay);
      const amount = parseFloat(newDisplay) || 0;
      setAmountPaid(newDisplay);
      onAmountChange(amount, Math.max(0, amount - total));
    } else if (value === 'OK') {
      const amount = parseFloat(calculatorDisplay) || 0;
      setAmountPaid(calculatorDisplay);
      onAmountChange(amount, Math.max(0, amount - total));
    } else {
      const newDisplay = calculatorDisplay + value;
      setCalculatorDisplay(newDisplay);
    }
  };

  const handleDirectInput = (value: string) => {
    setAmountPaid(value);
    setCalculatorDisplay(value);
    const amount = parseFloat(value) || 0;
    onAmountChange(amount, Math.max(0, amount - total));
  };

  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = Math.max(0, amountPaidNum - total);

  const quickAmounts = [
    { label: "Exacto", value: total },
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
    { label: "$200", value: 200 },
    { label: "$500", value: 500 },
    { label: "$1000", value: 1000 }
  ];

  return (
    <div className="space-y-4">
      {/* Amount Input */}
      <div className="space-y-2">
        <Label>Monto Recibido</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amountPaid}
          onChange={(e) => handleDirectInput(e.target.value)}
          className="text-lg font-medium text-center"
        />
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {quickAmounts.map((amount) => (
          <Button
            key={amount.label}
            variant="outline"
            size="sm"
            onClick={() => handleDirectInput(amount.value.toString())}
            className="text-xs"
          >
            {amount.label}
          </Button>
        ))}
      </div>

      {/* Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={calculatorDisplay}
            readOnly
            placeholder="0"
            className="text-center font-mono text-lg"
          />
          <div className="grid grid-cols-4 gap-2">
            {calculatorButtons.flat().map((btn, index) => (
              <Button
                key={index}
                variant={btn === 'OK' ? "default" : "outline"}
                size="sm"
                onClick={() => handleCalculatorClick(btn)}
                className="h-10 font-medium"
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="space-y-2 p-4 bg-accent/20 rounded-lg">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="font-medium">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Recibido:</span>
          <span className="font-medium">${amountPaidNum.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm font-medium">Cambio:</span>
          <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${change.toFixed(2)}
          </span>
        </div>
        {amountPaidNum < total && amountPaidNum > 0 && (
          <p className="text-sm text-red-600 text-center">
            Faltan ${(total - amountPaidNum).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}