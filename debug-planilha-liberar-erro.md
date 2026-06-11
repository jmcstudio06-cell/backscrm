# Debug Session: planilha-liberar-erro

- Status: OPEN
- Started at: 2026-06-11
- Symptom: erro ao liberar acesso na pagina `/planilha-gratuita`
- Expected: cadastro salvo e planilha liberada

## Hypotheses

1. O `insert` em `guide_leads` ainda falha por causa de schema divergente entre ambiente publicado e codigo local.
2. O erro vem de RLS/permissao no ambiente publicado, nao de validacao ou coluna.
3. O frontend publicado ainda nao contem o fallback novo e esta executando bundle antigo.
4. O `insert` esta chegando com payload invalido para o banco publicado.
5. O erro acontece antes ou depois do `insert`, por exemplo no `localStorage` ou no redirecionamento.

## Evidence

- Pendente

## Next Steps

1. Instrumentar a pagina com logs de debug.
2. Reproduzir o erro com a pagina publicada.
3. Coletar logs antes/depois do `insert`.
4. Confirmar ou rejeitar hipoteses.
