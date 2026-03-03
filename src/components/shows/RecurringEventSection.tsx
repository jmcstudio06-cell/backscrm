import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Repeat, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecurringConfig {
  enabled: boolean;
  frequency: "weekly";
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startDate: string;
  endDate: string;
}

interface RecurringEventSectionProps {
  config: RecurringConfig;
  onChange: (config: RecurringConfig) => void;
  baseDate?: string;
}

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export function RecurringEventSection({
  config,
  onChange,
  baseDate,
}: RecurringEventSectionProps) {
  // When base date changes, update dayOfWeek to match
  const handleBaseDate = () => {
    if (baseDate && !config.startDate) {
      const date = new Date(baseDate + "T12:00:00");
      const dayOfWeek = date.getDay();
      onChange({
        ...config,
        startDate: baseDate,
        dayOfWeek,
      });
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-accent" />
          <Label htmlFor="recurring-toggle" className="font-semibold cursor-pointer">
            Evento Recorrente
          </Label>
        </div>
        <Switch
          id="recurring-toggle"
          checked={config.enabled}
          onCheckedChange={(checked) => {
            if (checked) {
              handleBaseDate();
            }
            onChange({ ...config, enabled: checked });
          }}
        />
      </div>

      {config.enabled && (
        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-muted-foreground">
            Este show será repetido automaticamente no período selecionado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Dia da Semana</Label>
              <Select
                value={config.dayOfWeek.toString()}
                onValueChange={(value) =>
                  onChange({ ...config, dayOfWeek: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Frequência</Label>
              <div className="h-10 px-3 rounded-md border bg-muted/50 flex items-center text-sm text-muted-foreground">
                Semanal
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring-start" className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Inicial
              </Label>
              <Input
                id="recurring-start"
                type="date"
                value={config.startDate}
                onChange={(e) => onChange({ ...config, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring-end" className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Final
              </Label>
              <Input
                id="recurring-end"
                type="date"
                value={config.endDate}
                min={config.startDate}
                onChange={(e) => onChange({ ...config, endDate: e.target.value })}
              />
            </div>
          </div>

          {config.startDate && config.endDate && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">
                <strong>Prévia:</strong> Serão criados shows toda{" "}
                <strong>{daysOfWeek.find((d) => d.value === config.dayOfWeek)?.label}</strong>{" "}
                de{" "}
                <strong>
                  {new Date(config.startDate + "T12:00:00").toLocaleDateString("pt-BR")}
                </strong>{" "}
                até{" "}
                <strong>
                  {new Date(config.endDate + "T12:00:00").toLocaleDateString("pt-BR")}
                </strong>
                {" "}
                ({calculateOccurrences(config)} shows)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Calculate number of occurrences
function calculateOccurrences(config: RecurringConfig): number {
  if (!config.startDate || !config.endDate) return 0;

  const start = new Date(config.startDate + "T12:00:00");
  const end = new Date(config.endDate + "T12:00:00");

  let count = 0;
  const current = new Date(start);

  // Find first occurrence on the correct day
  while (current.getDay() !== config.dayOfWeek && current <= end) {
    current.setDate(current.getDate() + 1);
  }

  // Count occurrences
  while (current <= end) {
    count++;
    current.setDate(current.getDate() + 7);
  }

  return count;
}

// Generate all dates for recurring events
export function generateRecurringDates(config: RecurringConfig): string[] {
  if (!config.enabled || !config.startDate || !config.endDate) return [];

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dates: string[] = [];
  const start = new Date(config.startDate + "T12:00:00");
  const end = new Date(config.endDate + "T12:00:00");
  const current = new Date(start);

  // Find first occurrence on the correct day
  while (current.getDay() !== config.dayOfWeek && current <= end) {
    current.setDate(current.getDate() + 1);
  }

  // Generate all dates
  while (current <= end) {
    dates.push(formatDateString(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}
