import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Fuel, MapPin, Calculator, RotateCcw } from "lucide-react";

interface TransportCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseValue?: (value: number) => void;
}

const TransportCalculatorModal = ({ open, onOpenChange, onUseValue }: TransportCalculatorModalProps) => {
  const [distance, setDistance] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("10");
  const [fuelPrice, setFuelPrice] = useState<string>("6.00");
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [litersNeeded, setLitersNeeded] = useState<number | null>(null);

  const calculateCost = () => {
    const distanceNum = parseFloat(distance.replace(",", "."));
    const consumptionNum = parseFloat(consumption.replace(",", "."));
    const priceNum = parseFloat(fuelPrice.replace(",", "."));

    if (distanceNum > 0 && consumptionNum > 0 && priceNum > 0) {
      const liters = distanceNum / consumptionNum;
      const cost = liters * priceNum;
      setLitersNeeded(liters);
      setTotalCost(cost);
    } else {
      setTotalCost(null);
      setLitersNeeded(null);
    }
  };

  const resetCalculator = () => {
    setDistance("");
    setConsumption("10");
    setFuelPrice("6.00");
    setTotalCost(null);
    setLitersNeeded(null);
  };

  const handleUseValue = () => {
    if (totalCost && onUseValue) {
      onUseValue(totalCost);
      onOpenChange(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    if (distance && consumption && fuelPrice) {
      calculateCost();
    }
  }, [distance, consumption, fuelPrice]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Calculadora de Transporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="distance" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Distância Total (km)
            </Label>
            <Input
              id="distance"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 500"
              value={distance}
              onChange={(e) => setDistance(e.target.value.replace(/[^0-9.,]/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumption" className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              Consumo Médio (km/l)
            </Label>
            <Input
              id="consumption"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 10"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value.replace(/[^0-9.,]/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelPrice" className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              Preço do Combustível (R$/l)
            </Label>
            <Input
              id="fuelPrice"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 6.00"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value.replace(/[^0-9.,]/g, ""))}
            />
          </div>

          {totalCost !== null && litersNeeded !== null && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Litros necessários:</span>
                  <span className="font-medium">{litersNeeded.toFixed(2)} L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Custo Total:
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fórmula: ({distance} km ÷ {consumption} km/l) × R$ {fuelPrice}/l
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={resetCalculator}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            {onUseValue && totalCost !== null && (
              <Button onClick={handleUseValue} className="flex-1">
                Usar Valor
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransportCalculatorModal;
