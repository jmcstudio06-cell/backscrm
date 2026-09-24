# Integrar o motor do BacksAI ao Backs Radar

## Objetivo
Manter a página atual do Backstage Pro, o mesmo login dos artistas e o bloqueio pelo plano Executivo, substituindo a busca instável pelo mecanismo que já funciona no BacksAI.

## O que foi confirmado
- O BacksAI é outro projeto seu e usa outro banco Supabase.
- A busca dele consulta primeiro a tabela `global_places`; quando há poucos registros na região, completa os resultados com Google Places e salva no próprio banco.
- A página atual do Backstage Pro usa `radar_places` e tenta completar cidades por OpenStreetMap/Overpass, caminho responsável pela demora e inconsistência atuais.
- O código disponível do BacksAI não oferece uma API externa pronta; a integração será feita trazendo o motor de busca para o Backstage Pro.
- Há um arquivo de exportação com 863 registros no projeto do BacksAI. Isso não confirma o tamanho atual da base online, portanto a base completa deverá ser transferida diretamente do banco ou por uma exportação atualizada.

## Implementação
1. **Trocar o mecanismo de busca**
   - Remover da busca ativa as consultas ao Nominatim e Overpass.
   - Adaptar a lógica funcional do BacksAI para a função segura do Backs Radar.
   - Consultar primeiro a base local; somente completar pelo Google quando a cidade ou categoria ainda tiver poucos resultados.

2. **Manter os filtros definidos para este produto**
   - Exibir somente Bares, Restaurantes, Hotéis e Casas de show.
   - Tratar casas noturnas como Casas de show.
   - Respeitar exatamente as cidades selecionadas e o estado definido pelo CEP.
   - Impedir mistura de categorias e eliminar resultados incompatíveis.

3. **Unificar os dados**
   - Adaptar os registros do BacksAI para a estrutura atual de `radar_places`.
   - Importar a base atualizada do BacksAI com deduplicação por identificador do local e categoria.
   - Preservar telefone, site, endereço, avaliação, cidade, estado e coordenadas.
   - Novos resultados encontrados pelo Google passam a alimentar essa mesma base compartilhada do Backstage Pro.

4. **Login e permissões**
   - Usar exclusivamente a sessão já aberta no Backstage Pro; nenhum segundo login será exibido.
   - Validar a sessão dentro da função de busca.
   - Manter o Backs Radar exclusivo do plano Executivo e respeitar liberações ou bloqueios manuais do administrador.
   - Não expor credenciais do Google ou acesso administrativo no navegador.

5. **Velocidade, custo e estabilidade**
   - Usar cache antes do Google, limitar cidades e chamadas por pesquisa, eliminar consultas repetidas e definir tempo máximo de resposta.
   - Retornar imediatamente os dados já salvos e atualizar apenas o que estiver ausente ou desatualizado.
   - Exibir mensagem clara quando o Google estiver indisponível, sem deixar o botão carregando indefinidamente.
   - Observação: o Google Maps é cobrado por uso; cache, autenticação e limites reduzem chamadas desnecessárias.

6. **Experiência na página atual**
   - Preservar CEP, seleção de cidades, quatro categorias, WhatsApp e “Enviar ao CRM”.
   - Mostrar progresso curto durante a busca e resultados por cidade/categoria.
   - Manter os contatos ocultos para quem não possui acesso ao módulo.

7. **Validação**
   - Testar Cruzeiro e São José dos Campos separadamente e juntas.
   - Confirmar que cada resultado pertence à cidade e categoria selecionadas.
   - Confirmar telefone, WhatsApp, envio ao CRM, bloqueio de plano e término do carregamento.
   - Conferir o funcionamento em celular e computador.

## Detalhes técnicos
- Google Places API (New) será chamado somente no servidor pela conexão segura do Google Maps.
- A função validará entradas, sessão e limites antes de qualquer consulta paga.
- A base local será a fonte principal; o Google será usado para preenchimento controlado.
- A transferência da base completa dependerá de acesso/exportação atual do banco do BacksAI; o arquivo encontrado no projeto contém 863 registros e pode servir apenas como carga inicial.
