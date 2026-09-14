# Backs Radar com base própria, sem Google

## Objetivo
Transformar os contatos já armazenados em uma base própria do Backs Radar, sem novas consultas ao Google, e entregar somente oportunidades realmente dentro da região e do raio escolhido.

## O que será alterado
- Remover totalmente a consulta ao Google Maps da pesquisa do Backs Radar.
- Manter os 252 contatos existentes como a base inicial do produto.
- Corrigir a localização dos contatos existentes usando o CEP presente no endereço e uma fonte pública de CEP, salvando cidade, estado e coordenadas corretas na base.
- Excluir da resposta qualquer contato sem localização validada, impedindo cidades distantes ou resultados apenas com nome parecido.
- Consultar a base em páginas, sem o limite padrão de 1.000 registros.
- Filtrar por distância real a partir do CEP do artista, raio escolhido e categorias selecionadas.
- Iniciar com todas as categorias selecionadas e permitir remover qualquer uma.
- Manter os contatos cobertos para planos sem Executivo, exibindo somente a quantidade encontrada.
- Trocar os textos que indicam Google/cache por “Base Backs Radar”.

## Limite atual da base
A base atual contém 252 contatos, concentrados em Cruzeiro/SP e Cuiabá/MT. A mudança organiza e filtra corretamente esses contatos, mas não cria cobertura nacional automaticamente. Novas regiões só terão resultados quando novos contatos forem importados para a base.

## Detalhes técnicos
- A função protegida validará o usuário e consultará somente `radar_places`.
- O CEP pesquisado será localizado pela BrasilAPI, sem chave paga e sem Google.
- Os endereços existentes terão o CEP extraído e convertido em coordenadas; registros sem CEP válido ficarão fora da busca por raio até serem corrigidos.
- A distância será calculada no banco por coordenadas, com ordenação do contato mais próximo ao mais distante.
- A base continuará somente leitura para artistas; manutenção e importações permanecerão administrativas.

## Validação
- Confirmar que um CEP de Cruzeiro não retorna São Paulo capital nem outras cidades fora do raio.
- Testar os raios de 10, 25, 50 e 100 km e a remoção individual de categorias.
- Confirmar que todos os registros válidos do filtro aparecem e que o bloqueio do plano Executivo continua funcionando.
