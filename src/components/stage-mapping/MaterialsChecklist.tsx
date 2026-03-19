import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaterialsChecklist as MaterialsChecklistType } from "@/hooks/useStageMappings";
import { Badge } from "@/components/ui/badge";
import { 
  Mic2, 
  Speaker, 
  Cable, 
  Zap, 
  Lightbulb,
  Headphones,
  Box,
  MonitorSpeaker
} from "lucide-react";

interface MaterialsChecklistProps {
  checklist: MaterialsChecklistType;
  observations: string;
  onChange: (checklist: MaterialsChecklistType) => void;
  onObservationsChange: (observations: string) => void;
}

const MATERIALS = [
  { key: "microfones", label: "Microfones", icon: Mic2, description: "Microfones com fio e sem fio" },
  { key: "pedestais", label: "Pedestais", icon: Box, description: "Suportes para microfones" },
  { key: "di_box", label: "DI Box", icon: Box, description: "Caixas de injeção direta" },
  { key: "cabos", label: "Cabos", icon: Cable, description: "Cabos XLR, P10, etc." },
  { key: "retornos_palco", label: "Retornos de Palco", icon: Speaker, description: "Monitores de chão" },
  { key: "monitores", label: "Monitores", icon: MonitorSpeaker, description: "Monitores in-ear ou de palco" },
  { key: "mesa_som", label: "Mesa de Som", icon: Headphones, description: "Console de mixagem" },
  { key: "energia_eletrica", label: "Energia Elétrica", icon: Zap, description: "Pontos de energia no palco" },
  { key: "iluminacao_basica", label: "Iluminação Básica", icon: Lightbulb, description: "Iluminação cênica" },
] as const;

export function MaterialsChecklist({ 
  checklist, 
  observations,
  onChange, 
  onObservationsChange 
}: MaterialsChecklistProps) {
  const handleToggle = (key: keyof MaterialsChecklistType) => {
    onChange({ ...checklist, [key]: !checklist[key] });
  };

  const selectedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Material Solicitado</h3>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCount} selecionados
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MATERIALS.map(({ key, label, icon: Icon, description }) => {
            const isChecked = checklist[key as keyof MaterialsChecklistType];
            return (
              <div
                key={key}
                className={`
                  flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isChecked 
                    ? "bg-primary/5 border-primary shadow-sm" 
                    : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                  }
                `}
                onClick={() => handleToggle(key as keyof MaterialsChecklistType)}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(key as keyof MaterialsChecklistType)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Label className="cursor-pointer text-sm font-medium">{label}</Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations" className="text-sm font-medium">Observações Gerais para a Casa de Show</Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Informações adicionais sobre necessidades técnicas, horários de passagem de som, requisitos especiais de energia, etc..."
          rows={5}
          className="resize-none"
        />
      </div>
    </div>
  );
}
