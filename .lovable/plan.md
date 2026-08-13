# Usuários (equipe dentro do app)

Cada dono de app poderá cadastrar usuários (a "banda" dele) com login próprio, função, abas liberadas e nível de permissão. Por enquanto: **1 usuário grátis** e os próximos ficam bloqueados (com aviso de upgrade pago).

## Como vai funcionar para o dono

Nova aba **Usuários** em Configurações (ou item no menu, dono apenas):

- Botão "Adicionar usuário" — cria e-mail + senha na hora (o usuário já entra sem confirmar e-mail).
- Campo **Função** (livre: ex. "Produtor", "Baixista", "Assistente").
- **Abas liberadas**: lista com todas as abas que o plano do dono libera. O dono marca só o que quer. Nunca é possível liberar uma aba que o plano dele não tem.
- **Nível de permissão**:
  - Visualizador — só vê
  - Editor — vê, cria e edita
  - Gerente — vê, cria, edita e apaga
- Ações: editar permissões/abas, resetar senha, desativar/excluir usuário.
- Limite: 1 usuário ativo. Ao tentar o segundo, aparece card "Usuários extras — em breve (recurso pago)" e o cadastro fica bloqueado.

## Como vai funcionar para o usuário convidado

- Entra pelo login normal com o e-mail/senha criados pelo dono.
- Vê os **dados do dono** (agenda, financeiro, clientes… conforme abas liberadas), não uma conta vazia.
- Menu mostra somente as abas liberadas.
- Botões de criar/editar/excluir aparecem conforme o nível: visualizador não vê botões de ação; editor não vê excluir.
- Sem acesso a: Planos/pagamentos, Usuários, Admin, Indicações, dados de assinatura do dono.

## Detalhes técnicos

**Banco**
- Tabela `workspace_members`: `owner_id`, `member_user_id`, `email`, `role_label`, `permission_level` (`viewer|editor|manager`), `allowed_features jsonb`, `is_active`, timestamps. GRANTs + RLS (dono gerencia os seus; membro lê o próprio registro).
- Função security definer `public.workspace_owner_for(_uid uuid)` → retorna o `owner_id` se `_uid` for membro ativo, senão `_uid`.
- Função `public.can_access_owner_data(_row_user_id uuid)` → true se `_row_user_id = auth.uid()` ou se auth.uid() é membro ativo daquele owner.
- Migração adicionando políticas de membro nas tabelas de dados do app (shows, transactions, clients, leads, budgets, contracts, musicians, goals, advances, repertoire, checklists, stage_mappings, performance_types, etc.):
  - leitura para membros ativos;
  - escrita para `editor`/`manager`;
  - delete só para `manager`.
- `profiles`: membro pode ler o perfil do dono (somente campos necessários já expostos hoje) para herdar plano/branding.

**Edge functions** (service role, validando JWT do dono):
- `workspace-member-create` — cria o usuário no Auth (senha definida pelo dono, e-mail já confirmado), grava em `workspace_members`, recusa se o dono já tem 1 membro ativo.
- `workspace-member-update` — atualiza função, abas, nível, ativo/inativo, senha.
- `workspace-member-delete` — remove do Auth e da tabela.

**Frontend**
- `src/hooks/useWorkspace.tsx`: expõe `ownerId`, `isMember`, `permissionLevel`, `can("create"|"edit"|"delete")`, `allowedFeatures`.
- Hooks de dados (`useShows`, `useTransactions`, `useClients`, `useLeads`, `useBudgets`, `useContracts`, `useMusicians`, `useGoals`, `useAdvances`, `useRepertoire`, `useChecklistTemplates`, `useStageMappings`, `useEquipment`, `useContentPlan`, `useAnnualGoals`, `ShowsProvider`) passam a usar `ownerId` no lugar de `user.id` nas queries e inserts.
- `useFeatureBlocks`: quando é membro, carrega o perfil do dono e cruza com `allowed_features` (interseção — o membro nunca ganha aba fora do plano do dono).
- `RequireFeature` já bloqueia rota; membros são redirecionados para a primeira aba liberada em vez de `/planos`.
- Guardas de UI de permissão nos botões de criar/editar/excluir das páginas com abas liberadas.
- Nova página `src/pages/Usuarios.tsx` + rota `/usuarios` (oculta para membros) e entrada no Sidebar.

## Entrega em fases

1. Migração (tabela, funções, políticas de membro) + edge functions.
2. `useWorkspace` + adaptação dos hooks de dados e do `useFeatureBlocks`.
3. Página Usuários (CRUD, limite de 1) + navegação.
4. Guardas de permissão nos botões de ação das páginas.
