# Plano Parceiros

Criar um novo plano chamado **Parceiros**, ativado por token (não por pagamento), com as mesmas funcionalidades do Starter, porém com **limite de 5 shows por mês** na agenda. Ao atingir o limite, o botão de criar novo show fica bloqueado. Nenhum outro plano é afetado.

## 1. Ativação por token no card "Garantir Acesso"

No card de resgate de brinde já existente no dashboard (`GiftClaimCard`), adicionar uma segunda ação ao lado do botão principal:

- Um campo "Token Parceiros" + botão **Ativar**.
- Token válido inicial: `parceirobacks` (case-insensitive, com trim).
- Ao validar, chamar uma edge function que atualiza o perfil do usuário para o plano Parceiros.
- Mensagens: sucesso ("Plano Parceiros ativado!") ou erro ("Token inválido").
- Não mencionar em lugar nenhum que o plano é vitalício ou permanente — apenas "Plano ativado com sucesso".

## 2. Novo plano no sistema

Adicionar a chave `parceiros` como plano reconhecido:

- **Front (`useFeatureBlocks.tsx` → `PLAN_MODULES`)**: mesmas features do Starter.
- **Back (`_shared/plan-features.ts`)**: `parceiros: STARTER_FEATURES`, sem entrada em `PLAN_DAYS` (não expira automaticamente).
- Incluir `parceiros` na lista `PAID_PLANS` de `GiftClaimCard.tsx` para não mostrar mais o resgate de brinde depois de ativado.
- Atualizar quaisquer checks de "plano ativo" para tratar `parceiros` como ativo (mesmo tratamento que Starter em `expire_old_trials`, dashboards, etc.).

## 3. Limite de 5 shows por mês (apenas plano Parceiros)

- Criar hook utilitário `useMonthlyShowLimit()` que:
  - Retorna `{ limit, used, remaining, blocked }`.
  - `limit = 5` apenas se `profile.plan === 'parceiros'`; caso contrário `limit = Infinity` e `blocked = false`.
  - `used` = contagem de shows do usuário no mês corrente (qualquer status exceto `cancelled`), fuso America/Sao_Paulo.
- Aplicar em **todos os pontos de criação de show**:
  - Botão "Novo Show" na Agenda e no Dashboard: quando `blocked`, desabilitar com tooltip "Limite de 5 shows/mês do plano Parceiros atingido".
  - `NovoShowModal`: bloquear submit se `blocked` (defesa em profundidade).
  - `ImportShowsModal` / import em massa: limitar a inserção respeitando `remaining`.
- Mostrar contador discreto na Agenda ("3 de 5 shows deste mês") somente para plano Parceiros.
- Nenhum outro plano vê o contador nem o bloqueio.

## 4. Edge function `activate-partner-token`

- Recebe `{ token }`, valida JWT do usuário.
- Compara token contra valor(es) permitido(s). Começar com `parceirobacks` fixo em `app_settings` (setting_key `partner_token`) para permitir troca futura sem redeploy; fallback ao literal se a setting não existir.
- Se válido: `UPDATE profiles SET plan = 'parceiros', feature_blocks = <starter blocks>, trial_start = null, updated_at = now() WHERE user_id = auth.uid()`.
- Retorna `{ ok: true }` ou `{ error }` com 400/401.

## 5. Detalhes técnicos

- **Sem migração de schema**: reutiliza `profiles.plan` e `profiles.feature_blocks`.
- `app_settings` já existe — inserir row `partner_token` = `parceirobacks` via insert tool.
- Contagem de shows do mês: query já usada em outros lugares (`shows` filtrado por `user_id` e `date` no mês atual, status ≠ `cancelled`).
- Manter `PAID_PLANS` e demais listas de planos ativos sincronizadas entre front e back.
- Nenhuma UI menciona "vitalício", "permanente" ou "grátis para sempre".

## Arquivos afetados

- `src/hooks/useFeatureBlocks.tsx` — adicionar `parceiros` em `PLAN_MODULES`.
- `src/components/gifts/GiftClaimCard.tsx` — campo de token + ativação; incluir `parceiros` em `PAID_PLANS`.
- `src/hooks/useMonthlyShowLimit.tsx` — **novo**.
- `src/pages/Agenda.tsx`, `src/components/shows/NovoShowModal.tsx`, `src/components/shows/ImportShowsModal.tsx`, botões de "Novo Show" no Dashboard — aplicar limite.
- `supabase/functions/activate-partner-token/index.ts` — **nova** edge function.
- `supabase/functions/_shared/plan-features.ts` — adicionar `parceiros`.
- `app_settings` — insert do token `parceirobacks`.
