import { useMemo } from "react";
import { CheckCircle2, Circle, HelpCircle, ListChecks, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterInteraction as ChapterInteractionType } from "@/lib/manual-interactions";
import type { ManualInteractions as StoredInteractions } from "@/lib/manual-progress";

type Props = {
  interaction: ChapterInteractionType;
  /** Valores já respondidos/persistidos. */
  values: StoredInteractions;
  /** Atualiza uma chave de interação (persistência fica a cargo do pai). */
  onChange: (key: string, value: string | boolean | number) => void;
};

/**
 * Renderiza a interação de um capítulo (reflexão, cenário ou checklist).
 * O estado vive no pai (persistido no Supabase/localStorage); este componente
 * é controlado e acessível por teclado.
 */
export function ChapterInteraction({ interaction, values, onChange }: Props) {
  if (interaction.type === "reflection") {
    return <Reflection interaction={interaction} values={values} onChange={onChange} />;
  }
  if (interaction.type === "scenario") {
    return <Scenario interaction={interaction} values={values} onChange={onChange} />;
  }
  return <Checklist interaction={interaction} values={values} onChange={onChange} />;
}

function Shell({
  eyebrow,
  icon,
  children,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      aria-label={eyebrow}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </span>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {eyebrow}
        </p>
      </div>
      {children}
    </section>
  );
}

function Reflection({
  interaction,
  values,
  onChange,
}: {
  interaction: Extract<ChapterInteractionType, { type: "reflection" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
}) {
  const answered = values[interaction.key];
  const isYes = answered === true;
  const isNo = answered === false;

  return (
    <Shell eyebrow="Reflexão" icon={<HelpCircle className="w-4 h-4" />}>
      <p className="text-[17px] sm:text-lg font-semibold text-slate-900 -tracking-[0.01em] leading-snug">
        {interaction.question}
      </p>
      <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label={interaction.question}>
        <button
          type="button"
          aria-pressed={isYes}
          onClick={() => onChange(interaction.key, true)}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
            isYes
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <CheckCircle2 className="w-4 h-4" /> Sim
        </button>
        <button
          type="button"
          aria-pressed={isNo}
          onClick={() => onChange(interaction.key, false)}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
            isNo
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          Ainda não
        </button>
      </div>
      {answered !== undefined && (
        <div
          className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-[14px] text-slate-600 leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300"
          role="status"
        >
          {isYes ? interaction.feedbackYes : interaction.feedbackNo}
        </div>
      )}
    </Shell>
  );
}

function Scenario({
  interaction,
  values,
  onChange,
}: {
  interaction: Extract<ChapterInteractionType, { type: "scenario" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
}) {
  const chosen = values[interaction.key] as string | undefined;
  const chosenOption = useMemo(
    () => interaction.options.find((o) => o.id === chosen),
    [interaction.options, chosen],
  );

  return (
    <Shell eyebrow="Cenário de decisão" icon={<Sparkles className="w-4 h-4" />}>
      <p className="text-[15px] text-slate-600 leading-relaxed">{interaction.situation}</p>
      <p className="mt-3 text-[17px] font-semibold text-slate-900 -tracking-[0.01em]">
        {interaction.prompt}
      </p>
      <ul className="mt-4 space-y-2.5" role="radiogroup" aria-label={interaction.prompt}>
        {interaction.options.map((opt) => {
          const selected = chosen === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(interaction.key, opt.id)}
                className={cn(
                  "w-full text-left flex gap-3 items-start rounded-xl border px-4 py-3.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  selected
                    ? opt.best
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-300 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white",
                    selected
                      ? opt.best
                        ? "bg-emerald-600"
                        : "bg-slate-700"
                      : "bg-slate-200",
                  )}
                  aria-hidden="true"
                >
                  {selected ? (
                    opt.best ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )
                  ) : null}
                </span>
                <span className="text-[15px] text-slate-700 leading-relaxed">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {chosenOption && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4 text-[14px] leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300",
            chosenOption.best
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-700",
          )}
          role="status"
        >
          <span className="font-bold">
            {chosenOption.best ? "Melhor escolha. " : "Vale repensar. "}
          </span>
          {chosenOption.feedback}
        </div>
      )}
    </Shell>
  );
}

function Checklist({
  interaction,
  values,
  onChange,
}: {
  interaction: Extract<ChapterInteractionType, { type: "checklist" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
}) {
  const checkedCount = interaction.items.filter(
    (it) => values[`${interaction.key}:${it.id}`] === true,
  ).length;
  const total = interaction.items.length;

  return (
    <Shell eyebrow="Checklist prático" icon={<ListChecks className="w-4 h-4" />}>
      <p className="text-[17px] sm:text-lg font-semibold text-slate-900 -tracking-[0.01em] leading-snug">
        {interaction.title}
      </p>
      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{interaction.helper}</p>

      <ul className="mt-4 space-y-2.5">
        {interaction.items.map((it) => {
          const key = `${interaction.key}:${it.id}`;
          const checked = values[key] === true;
          return (
            <li key={it.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onChange(key, !checked)}
                className={cn(
                  "w-full text-left flex gap-3 items-start rounded-xl border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  checked
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[15px] leading-relaxed",
                    checked ? "text-slate-900" : "text-slate-700",
                  )}
                >
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm font-semibold text-slate-500" aria-live="polite">
        {checkedCount} de {total} marcados
        {checkedCount < total
          ? " — os itens em aberto são seus próximos pontos de melhoria."
          : " — rotina completa. Agora é manter isso em todo show."}
      </p>
    </Shell>
  );
}
