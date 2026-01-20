-- Remove o trigger duplicado que está causando o erro de chave duplicada
DROP TRIGGER IF EXISTS create_welcome_gift_trigger ON public.profiles;

-- Remove a função que não é mais necessária
DROP FUNCTION IF EXISTS create_welcome_gift();