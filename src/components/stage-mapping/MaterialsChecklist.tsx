import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaterialsChecklist as MaterialsChecklistType } from "@/hooks/useStageMappings";
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
  { key: "microfones", label: "Microfones", icon: Mic2 },
  { key: "pedestais", label: "Pedestais", icon: Box },
  { key: "di_box", label: "DI Box", icon: Box },
  { key: "cabos", label: "Cabos", icon: Cable },
  { key: "retornos_palco", label: "Retornos de Palco", icon: Speaker },
  { key: "monitores", label: "Monitores", icon: MonitorSpeaker },
  { key: "mesa_som", label: "Mesa de Som", icon: Headphones },
  { key: "energia_eletrica", label: "Energia Elétrica", icon: Zap },
  { key: "iluminacao_basica", label: "Iluminação Básica", icon: Lightbulb },
] as const;

export function MaterialsChecklist({ 
  checklist, 
  observations,
  onChange, 
  onObservationsChange 
}: MaterialsChecklistProps) {
  const handleToggle = (key: keyof MaterialsChecklistType) => {
    onChange({
      ...checklist,
      [key]: !checklist[key],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Material Solicitado</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MATERIALS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${checklist[key as keyof MaterialsChecklistType] 
                  ? "bg-primary/10 border-primary" 
                  : "bg-card border-border hover:border-primary/50"
                }
              `}
              onClick={() => handleToggle(key as keyof MaterialsChecklistType)}
            >
              <Checkbox
                checked={checklist[key as keyof MaterialsChecklistType]}
                onCheckedChange={() => handleToggle(key as keyof MaterialsChecklistType)}
              />
              <Icon className="w-4 h-4 text-muted-foreground" />
              <Label className="cursor-pointer text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observações Gerais para a Casa de Show</Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Informações adicionais sobre necessidades técnicas, horários de passagem de som, etc..."
          rows={4}
        />
      </div>
    </div>
  );
}
