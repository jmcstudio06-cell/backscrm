import { useMemo } from "react";
import { Check, HelpCircle, ListChecks, Sparkles, X } from "lucide-react";
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
 * Interação do capítulo (reflexão, cenário de decisão ou checklist).
 * Componente controlado: o estado vive no pai e é persistido por lá.
 * Estilos vêm de src/styles/kit.css (escopo .kit-page).
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
    <section className="kp-interact" aria-label={eyebrow}>
      <div className="kp-interact-head">
        <span className="kp-icon-tile" aria-hidden="true">
          {icon}
        </span>
        <div>
          <small>Pare e pense</small>
          <strong>{eyebrow}</strong>
        </div>
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
    <Shell eyebrow="Reflexão sobre a sua carreira" icon={<HelpCircle />}>
      <p className="kp-interact-question">{interaction.question}</p>
      <div className="kp-choice-row" role="group" aria-label={interaction.question}>
        <button
          type="button"
          aria-pressed={isYes}
          onClick={() => onChange(interaction.key, true)}
          className={cn("kp-choice", isYes && "is-selected is-good")}
        >
          <Check aria-hidden="true" /> Sim, já faço
        </button>
        <button
          type="button"
          aria-pressed={isNo}
          onClick={() => onChange(interaction.key, false)}
          className={cn("kp-choice", isNo && "is-selected")}
        >
          Ainda não
        </button>
      </div>
      {answered !== undefined && (
        <div className="kp-feedback" role="status">
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
    <Shell eyebrow="Cenário de decisão" icon={<Sparkles />}>
      <div className="kp-scenario">
        <span className="kp-scenario-label">A situação</span>
        <p>{interaction.situation}</p>
      </div>
      <p className="kp-interact-question">{interaction.prompt}</p>
      <ul className="kp-options" role="radiogroup" aria-label={interaction.prompt}>
        {interaction.options.map((opt, i) => {
          const selected = chosen === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(interaction.key, opt.id)}
                className={cn(
                  "kp-option",
                  selected && "is-selected",
                  selected && (opt.best ? "is-good" : "is-meh"),
                )}
              >
                <span className="kp-option-key" aria-hidden="true">
                  {selected ? opt.best ? <Check /> : <X /> : String.fromCharCode(65 + i)}
                </span>
                <span>{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {chosenOption && (
        <div className={cn("kp-feedback", chosenOption.best && "is-good")} role="status">
          <strong>{chosenOption.best ? "Melhor escolha. " : "Vale repensar. "}</strong>
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
  const pct = Math.round((checkedCount / total) * 100);

  return (
    <Shell eyebrow="Checklist prático" icon={<ListChecks />}>
      <p className="kp-interact-question">{interaction.title}</p>
      <p className="kp-interact-helper">{interaction.helper}</p>

      <ul className="kp-options">
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
                className={cn("kp-option", checked && "is-selected is-good")}
              >
                <span className="kp-checkbox" aria-hidden="true">
                  {checked && <Check />}
                </span>
                <span>{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="kp-checklist-foot" aria-live="polite">
        <div className="kp-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p>
          <strong>
            {checkedCount} de {total}
          </strong>{" "}
          {checkedCount < total
            ? "· os itens em aberto são seus próximos pontos de melhoria."
            : "· rotina completa. Agora é manter isso em todo show."}
        </p>
      </div>
    </Shell>
  );
}
