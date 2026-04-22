// Checklist agora é 100% local (sem persistência no Supabase).
// Mantemos esta API por compatibilidade, mas sempre retorna 0 — nenhum badge
// global de itens pendentes faz sentido sem dados no banco.
export function usePendingChecklist() {
  return { pendingCount: 0, loading: false };
}
