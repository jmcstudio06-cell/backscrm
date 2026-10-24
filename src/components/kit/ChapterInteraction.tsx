import { useMemo } from "react";
import { Check, HelpCircle, ListChecks, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checklistConfirmedKey,
  type ChapterInteraction as ChapterInteractionType,
} from "@/lib/manual-interactions";
import type { ManualInteractions as StoredInteractions } from "@/lib/manual-progress";

type Props = {
  interaction: ChapterInteractionType;
  /** Valores já respondidos/persistidos. */
  values: StoredInteractions;
  /** Atualiza uma chave de interação (persistência fica a cargo do pai). */
  onChange: (key: string, value: string | boolean | number) => void;
  /** Rótulo de etapa, ex.: "Atividade 1 de 2". */
  step?: string;
  /** Já respondida (mostra o selo de concluída). */
  answered?: boolean;
  /** Id usado para rolar até a próxima atividade pendente. */
  id?: string;
};

type Meta = Pick<Props, "step" | "answered" | "id">;

/**
 * Interação do capítulo (reflexão, cenário de decisão ou checklist).
 * Componente controlado: o estado vive no pai e é persistido por lá.
 * Estilos vêm de src/styles/kit.css (escopo .kit-page).
 */
export function ChapterInteraction({ interaction, values, onChange, step, answered, id }: Props) {
  const meta: Meta = { step, answered, id };
  if (interaction.type === "reflection") {
    return <Reflection interaction={interaction} values={values} onChange={onChange} meta={meta} />;
  }
  if (interaction.type === "scenario") {
    return <Scenario interaction={interaction} values={values} onChange={onChange} meta={meta} />;
  }
  return <Checklist interaction={interaction} values={values} onChange={onChange} meta={meta} />;
}

function Shell({
  eyebrow,
  icon,
  meta,
  children,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  meta: Meta;
  children: React.ReactNode;
}) {
  return (
    <section
      id={meta.id}
      className={cn("kp-interact", meta.answered && "is-answered")}
      aria-label={`${meta.step ? `${meta.step}: ` : ""}${eyebrow}`}
    >
      <div className="kp-interact-head">
        <span className="kp-icon-tile" aria-hidden="true">
          {icon}
        </span>
        <div>
          <small>{meta.step ?? "Pare e pense"}</small>
          <strong>{eyebrow}</strong>
        </div>
        <span className={cn("kp-interact-status", meta.answered && "is-done")}>
          {meta.answered ? (
            <>
              <Check aria-hidden="true" /> Respondida
            </>
          ) : (
            "Responda para continuar"
          )}
        </span>
      </div>
      {children}
    </section>
  );
}

function Reflection({
  interaction,
  values,
  onChange,
  meta,
}: {
  interaction: Extract<ChapterInteractionType, { type: "reflection" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
  meta: Meta;
}) {
  const answered = values[interaction.key];
  const isYes = answered === true;
  const isNo = answered === false;

  return (
    <Shell eyebrow="Reflexão sobre a sua carreira" icon={<HelpCircle />} meta={meta}>
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
  meta,
}: {
  interaction: Extract<ChapterInteractionType, { type: "scenario" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
  meta: Meta;
}) {
  const chosen = values[interaction.key] as string | undefined;
  const chosenOption = useMemo(
    () => interaction.options.find((o) => o.id === chosen),
    [interaction.options, chosen],
  );

  return (
    <Shell eyebrow={interaction.key.includes("_quiz_") ? "Checagem rápida" : "Cenário de decisão"} icon={<Sparkles />} meta={meta}>
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
  meta,
}: {
  interaction: Extract<ChapterInteractionType, { type: "checklist" }>;
  values: StoredInteractions;
  onChange: Props["onChange"];
  meta: Meta;
}) {
  const checkedCount = interaction.items.filter(
    (it) => values[`${interaction.key}:${it.id}`] === true,
  ).length;
  const total = interaction.items.length;
  const pct = Math.round((checkedCount / total) * 100);
  const confirmed = values[checklistConfirmedKey(interaction.key)] === true;

  return (
    <Shell eyebrow="Checklist prático" icon={<ListChecks />} meta={meta}>
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

      {confirmed ? (
        <div className="kp-feedback is-good" role="status">
          <strong>Checklist registrado. </strong>
          {checkedCount === total
            ? "Você já pratica todos os itens."
            : `Seus próximos pontos de melhoria: ${total - checkedCount} ${total - checkedCount === 1 ? "item" : "itens"} em aberto. Você pode voltar e atualizar quando quiser.`}
        </div>
      ) : (
        <button
          type="button"
          className="kp-btn kp-btn-primary kp-confirm"
          onClick={() => onChange(checklistConfirmedKey(interaction.key), true)}
        >
          <Check /> Confirmar meu checklist
        </button>
      )}
    </Shell>
  );
}
