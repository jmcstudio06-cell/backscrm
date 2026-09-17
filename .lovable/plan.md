# Backs Radar: categorias unificadas e cidades vizinhas

## Resultado
- Manter quatro filtros: Bares, Restaurantes, Hotéis e Casas de show.
- Tratar casas noturnas como Casas de show, sem criar um quinto filtro.
- Ao carregar o CEP, mostrar cidades próximas que possuem oportunidades na base própria.
- Permitir clicar em Lorena, Lavrinhas ou outra cidade sugerida para adicioná-la à pesquisa.
- Pesquisar somente nas cidades selecionadas e identificar corretamente a cidade de cada contato.

## Implementação
- Ajustar a classificação para aceitar `casa noturna`, `boate`, `night club` e equivalentes dentro de `casas_de_show`.
- Fazer a função de busca retornar cidades próximas ordenadas por distância a partir do CEP, usando as coordenadas já armazenadas na base.
- Enviar a lista de cidades selecionadas na pesquisa e filtrar os contatos por essas cidades, sem repetir a busca do CEP para cada cidade.
- Substituir a lista de todos os municípios do estado pelas sugestões realmente próximas e clicáveis.
- Validar separação de categorias, seleção de cidades e funcionamento da busca.
