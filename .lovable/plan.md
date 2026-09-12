# Backs Radar por raio e categorias

## Objetivo
Garantir que a busca parta da localização correta do CEP, considere apenas oportunidades dentro do raio escolhido e comece com todas as categorias selecionadas.

## Alterações
- Trocar a localização aproximada atual por coordenadas validadas do CEP no servidor.
- Aplicar filtro geográfico estrito em cada resultado antes de exibi-lo.
- Iniciar com bares, restaurantes, hotéis, casas noturnas, casas de show e buffets selecionados, permitindo remover qualquer categoria.
- Buscar cada categoria selecionada e reunir os resultados sem duplicidades ou limite adicional imposto pela tela.
- Corrigir o cache para separar resultados por coordenada e raio, evitando reutilizar dados de outra região.
- Mostrar claramente a quantidade encontrada e manter os contatos completos somente para o plano Executivo.

## Detalhes técnicos
- A API do Google limita a quantidade devolvida por consulta; para ampliar a cobertura, a busca fará consultas segmentadas por categoria e termos relevantes, deduplicando pelo identificador do local.
- O número exibido será tudo que o Google disponibilizar nessas consultas, sem corte adicional do aplicativo.
- Validar a função publicada e testar CEP, raio, remoção de categorias e ausência de cidades distantes.
