# Backs Radar: cidades do estado inteiro

## Resultado
- O CEP continuará definindo a cidade e o estado base do artista.
- A busca de cidades permitirá escolher qualquer município do mesmo estado.
- Municípios de outros estados nunca aparecerão nem serão aceitos na pesquisa.
- Os contatos serão exibidos somente para as cidades selecionadas e categorias escolhidas.

## Implementação
- Carregar a lista oficial de municípios do estado identificado pelo CEP e usá-la no campo de busca de cidades.
- Manter a cidade base sempre selecionada e permitir adicionar outras cidades do mesmo estado.
- Validar no servidor que todas as cidades enviadas pertencem ao estado do CEP.
- Consultar a base própria por estado e cidades selecionadas, sem limitar essas escolhas ao raio de 100 km.
- Manter as quatro categorias atuais e a regra de Casas noturnas dentro de Casas de show.
- Validar seleção de cidades, bloqueio entre estados e resultados da base própria.
