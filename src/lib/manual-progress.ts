import { supabase } from "@/integrations/supabase/client";

/**
 * Persistência do progresso de leitura do Manual do Artista Contratado.
 *
 * A página /kit-profissional é pública e o visitante não está logado no app —
 * ele apenas informa o WhatsApp no modal de lead. Por isso o progresso é
 * vinculado ao telefone (somente dígitos) capturado, e gravado na tabela
 * public.manual_progress.
 *
 * Resiliência: se a tabela ainda não existir (migração não aplicada) ou a rede
 * falhar, caímos para localStorage para que a leitura nunca trave. Os dois
 * caminhos usam o mesmo formato de dados.
 */

export type ManualInteractions = Record<string, string | boolean | number>;

export interface ManualProgress {
  chapterIndex: number;
  completed: boolean;
  interactions: ManualInteractions;
}

const LS_PREFIX = "manual_artista_progress:";

const DEFAULT_PROGRESS: ManualProgress = {
  chapterIndex: 0,
  completed: false,
  interactions: {},
};

function lsKey(phone: string) {
  return `${LS_PREFIX}${phone}`;
}

function readLocal(phone: string): ManualProgress | null {
  try {
    const raw = localStorage.getItem(lsKey(phone));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ManualProgress>;
    return {
      chapterIndex: Number(parsed.chapterIndex) || 0,
      completed: Boolean(parsed.completed),
      interactions: (parsed.interactions as ManualInteractions) || {},
    };
  } catch {
    return null;
  }
}

function writeLocal(phone: string, progress: ManualProgress) {
  try {
    localStorage.setItem(lsKey(phone), JSON.stringify(progress));
  } catch {
    /* storage cheio ou indisponível — ignora, não bloqueia a leitura */
  }
}

/** Normaliza o telefone para somente dígitos (chave estável do lead). */
export function phoneKey(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Carrega o progresso salvo. Tenta Supabase primeiro; se indisponível, usa o
 * localStorage. Nunca lança — sempre retorna um progresso utilizável.
 */
export async function loadManualProgress(phone: string): Promise<ManualProgress> {
  const key = phoneKey(phone);
  if (!key) return { ...DEFAULT_PROGRESS };

  const local = readLocal(key);

  try {
    const { data, error } = await supabase
      .from("manual_progress")
      .select("chapter_index,completed,interactions")
      .eq("lead_phone", key)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const remote: ManualProgress = {
        chapterIndex: Number(data.chapter_index) || 0,
        completed: Boolean(data.completed),
        interactions: (data.interactions as ManualInteractions) || {},
      };
      // mantém o local em sincronia para leituras offline futuras
      writeLocal(key, remote);
      return remote;
    }

    // Sem registro remoto: se havia local, semeia o remoto com ele.
    if (local) {
      void saveManualProgress(phone, local);
      return local;
    }

    return { ...DEFAULT_PROGRESS };
  } catch {
    // Supabase indisponível/tabela ausente — usa o que houver em localStorage.
    return local ?? { ...DEFAULT_PROGRESS };
  }
}

/**
 * Salva (upsert) o progresso. Grava sempre no localStorage (garantia imediata)
 * e tenta espelhar no Supabase. Falhas de rede/schema são silenciosas.
 */
export async function saveManualProgress(
  phone: string,
  progress: ManualProgress,
): Promise<void> {
  const key = phoneKey(phone);
  if (!key) return;

  // garantia local imediata
  writeLocal(key, progress);

  try {
    await supabase.from("manual_progress").upsert(
      {
        lead_phone: key,
        chapter_index: progress.chapterIndex,
        completed: progress.completed,
        interactions: progress.interactions,
      },
      { onConflict: "lead_phone" },
    );
  } catch {
    /* fallback já garantido pelo localStorage */
  }
}
