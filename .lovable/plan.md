# Corrigir cidades sem contatos no Backs Radar

## Objetivo
Evitar resultado vazio quando uma cidade escolhida ainda não existe na base própria, sem voltar a depender do Google Maps.

## Implementação
- Manter a pesquisa principal exclusivamente na tabela própria `radar_places`.
- Quando uma cidade selecionada ainda não tiver contatos cadastrados, consultar o OpenStreetMap/Overpass para encontrar bares, restaurantes, hotéis e casas noturnas/casas de show com telefone público.
- Validar categoria, telefone, cidade e estado; excluir salões de festa, buffets, lojas e locais fora das quatro categorias.
- Salvar os novos contatos em `radar_places` como `base_propria`, evitando duplicações por local/telefone/endereço.
- Refazer a consulta após o preenchimento para devolver os resultados já na mesma pesquisa.
- Se a fonte pública estiver indisponível, continuar usando normalmente os contatos que já estiverem na base.

## Validação
- Testar São José dos Campos com as quatro categorias.
- Confirmar que os contatos ficam na categoria correta e pertencem somente a SP e à cidade selecionada.
- Confirmar que pesquisas seguintes usam os dados salvos, sem depender de nova consulta externa.
