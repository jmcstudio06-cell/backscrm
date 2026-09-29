# Corrigir pedido repetido de notificações

## O que será alterado
- Reconhecer imediatamente quando a permissão de notificações já estiver concedida, sem exigir que a inscrição seja refeita para esconder o aviso.
- Registrar no aparelho quando a pessoa já respondeu ao aviso, evitando que ele reapareça a cada acesso.
- Manter a renovação da inscrição funcionando silenciosamente, sem abrir novamente o pedido de permissão.
- Conferir que o projeto continua abrindo normalmente após a correção.

## Detalhes técnicos
- Ajustar o aviso de notificações e a rotina compartilhada de ativação.
- Não alterar o recebimento das notificações nem os lembretes existentes.
