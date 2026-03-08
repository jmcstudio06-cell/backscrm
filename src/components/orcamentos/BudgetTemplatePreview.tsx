import { Check } from "lucide-react";
import { BudgetTemplate } from "@/hooks/useCustomization";

interface Props {
  selected: BudgetTemplate;
  onSelect: (t: BudgetTemplate) => void;
}

const templates: { key: BudgetTemplate; label: string; desc: string }[] = [
  { key: "classico", label: "Clássico", desc: "Colorido e vibrante com destaque em roxo" },
  { key: "minimalista", label: "Minimalista", desc: "Limpo, profissional, sem cores fortes" },
  { key: "elegante", label: "Elegante", desc: "Sofisticado com dourado e fundo escuro" },
];

function MiniPreview({ template }: { template: BudgetTemplate }) {
  if (template === "classico") {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded-md p-2 flex flex-col gap-1.5 text-[6px] font-sans border border-border overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-[#6366f1]" />
            <div className="space-y-0.5">
              <div className="w-10 h-1 bg-foreground/60 rounded" />
              <div className="w-6 h-0.5 bg-muted-foreground/40 rounded" />
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#6366f1] text-[7px]">ORÇAMENTO</div>
            <div className="w-8 h-0.5 bg-muted-foreground/30 rounded ml-auto mt-0.5" />
          </div>
        </div>
        <div className="h-px bg-[#6366f1]" />
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-[#6366f1] rounded" />
            <div className="w-8 h-0.5 bg-foreground/40 rounded" />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="w-6 h-0.5 bg-[#6366f1] rounded ml-auto" />
            <div className="w-8 h-0.5 bg-foreground/40 rounded" />
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 space-y-0.5">
          <div className="bg-[#6366f1] rounded-sm h-2 flex items-center px-1">
            <div className="w-full flex justify-between">
              <div className="w-6 h-0.5 bg-white/80 rounded" />
              <div className="w-3 h-0.5 bg-white/80 rounded" />
            </div>
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 flex items-center px-1 rounded-sm ${i % 2 === 0 ? "bg-muted/50" : ""}`}>
              <div className="w-full flex justify-between">
                <div className="w-8 h-0.5 bg-foreground/30 rounded" />
                <div className="w-3 h-0.5 bg-foreground/30 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-[#6366f1] rounded-sm px-1.5 py-0.5 flex justify-between w-12">
            <span className="text-white font-bold text-[5px]">TOTAL</span>
            <span className="text-white font-bold text-[5px]">R$</span>
          </div>
        </div>
        <div className="bg-[#f0f0ff] rounded-sm py-0.5 text-center">
          <div className="text-[#6366f1] font-bold text-[5px]">Obrigado!</div>
        </div>
      </div>
    );
  }

  if (template === "minimalista") {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded-md p-2.5 flex flex-col text-[6px] font-sans border border-border overflow-hidden">
        {/* Header: label + name left, number right */}
        <div className="flex justify-between items-end pb-1.5 border-b border-foreground/10 mb-2">
          <div className="space-y-0.5">
            <div className="text-[4px] text-muted-foreground/50 uppercase tracking-widest">Orçamento</div>
            <div className="w-12 h-1 bg-foreground/60 rounded" />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="w-6 h-0.5 bg-muted-foreground/30 rounded ml-auto" />
            <div className="w-8 h-0.5 bg-muted-foreground/20 rounded ml-auto" />
          </div>
        </div>

        {/* Client */}
        <div className="mb-2 space-y-0.5">
          <div className="text-[4px] text-muted-foreground/40 uppercase tracking-widest">Para</div>
          <div className="w-10 h-0.5 bg-foreground/50 rounded" />
          <div className="w-7 h-0.5 bg-muted-foreground/20 rounded" />
        </div>

        {/* Table */}
        <div className="flex-1 space-y-0.5">
          <div className="border-b-[1.5px] border-foreground/15 h-2 flex items-center">
            <div className="w-full flex justify-between">
              <div className="w-6 h-0.5 bg-foreground/30 rounded" />
              <div className="w-3 h-0.5 bg-foreground/30 rounded" />
            </div>
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className="h-2 flex items-center border-b border-foreground/5">
              <div className="w-full flex justify-between">
                <div className="w-8 h-0.5 bg-foreground/15 rounded" />
                <div className="w-3 h-0.5 bg-foreground/15 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Total — just a line */}
        <div className="flex justify-end pt-1">
          <div className="border-t-[1.5px] border-foreground/15 pt-0.5 w-12 flex justify-between">
            <span className="text-foreground/50 font-medium text-[5px]">TOTAL</span>
            <span className="text-foreground/70 font-medium text-[5px]">R$</span>
          </div>
        </div>

        {/* Subtle footer */}
        <div className="mt-1.5 pt-1 border-t border-foreground/5 text-center">
          <div className="text-muted-foreground/30 text-[4px] italic">Obrigado pela preferência</div>
        </div>
      </div>
    );
  }

  // Elegante — layout diferenciado inspirado em invoice moderna
  return (
    <div className="w-full aspect-[3/4] bg-white rounded-md flex flex-col text-[6px] font-sans border border-border overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#1a1a2e] via-[#c9a84c] to-[#1a1a2e]" />
      <div className="flex-1 flex flex-col gap-1 p-2">
        {/* Header: logo left, ORÇAMENTO right */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-[#1a1a2e] flex items-center justify-center">
              <div className="w-2 h-0.5 bg-[#c9a84c] rounded" />
            </div>
            <div className="space-y-0.5">
              <div className="w-10 h-1 bg-[#1a1a2e] rounded" />
              <div className="w-6 h-0.5 bg-muted-foreground/40 rounded" />
            </div>
          </div>
          <div className="text-right">
            <div className="font-black text-[#1a1a2e] text-[8px] tracking-wider">ORÇAMENTO</div>
            <div className="w-8 h-0.5 bg-[#c9a84c] rounded ml-auto mt-0.5" />
          </div>
        </div>

        {/* Client info row with gold accent */}
        <div className="flex justify-between border-l-2 border-[#c9a84c] pl-1 mt-0.5">
          <div className="space-y-0.5">
            <div className="w-3 h-0.5 bg-[#c9a84c] rounded" />
            <div className="w-8 h-0.5 bg-foreground/40 rounded" />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="w-6 h-0.5 bg-muted-foreground/30 rounded ml-auto" />
            <div className="w-8 h-0.5 bg-muted-foreground/30 rounded" />
          </div>
        </div>

        {/* Table with numbered rows */}
        <div className="flex-1 space-y-0.5 mt-0.5">
          <div className="bg-[#1a1a2e] rounded-sm h-2 flex items-center px-1">
            <div className="w-full flex justify-between">
              <div className="flex gap-1">
                <div className="w-2 h-0.5 bg-[#c9a84c] rounded" />
                <div className="w-5 h-0.5 bg-white/80 rounded" />
              </div>
              <div className="w-3 h-0.5 bg-white/80 rounded" />
            </div>
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 flex items-center px-1 rounded-sm ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
              <div className="w-full flex justify-between">
                <div className="flex gap-1">
                  <div className="w-1.5 h-0.5 bg-[#c9a84c]/40 rounded" />
                  <div className="w-7 h-0.5 bg-foreground/25 rounded" />
                </div>
                <div className="w-3 h-0.5 bg-foreground/25 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Totals aligned right */}
        <div className="flex justify-end">
          <div className="bg-[#1a1a2e] rounded-sm px-1.5 py-0.5 flex justify-between w-12">
            <span className="text-[#c9a84c] font-bold text-[5px]">TOTAL</span>
            <span className="text-white font-bold text-[5px]">R$</span>
          </div>
        </div>
      </div>
      {/* Bottom accent bar */}
      <div className="bg-[#1a1a2e] px-2 py-1 flex justify-between items-center">
        <div className="w-8 h-0.5 bg-white/30 rounded" />
        <div className="w-6 h-0.5 bg-[#c9a84c]/60 rounded" />
      </div>
    </div>
  );
}

export function BudgetTemplatePreview({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {templates.map(({ key, label, desc }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-glow scale-[1.02]"
                : "border-border hover:border-muted-foreground hover:shadow-card"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="w-full max-w-[140px]">
              <MiniPreview template={key} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
