-- Desabilitar RLS (Row Level Security) temporariamente
-- Execute este script no SQL Editor do Supabase para permitir cadastros via API

-- Desabilitar RLS na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- IMPORTANTE:
-- Com RLS desabilitado, qualquer aplicação pode acessar todos os dados
-- Isso é adequado para desenvolvimento/teste
-- Para produção, configure políticas RLS adequadas

-- Para reabilitar RLS no futuro (quando configurar políticas):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;