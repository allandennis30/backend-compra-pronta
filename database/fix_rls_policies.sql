-- Script para corrigir as políticas de RLS (Row Level Security)
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Ou criar políticas que permitam inserção de usuários
-- Descomente as linhas abaixo se quiser manter RLS ativo

-- Política para permitir inserção de novos usuários
-- CREATE POLICY "Allow insert for new users" ON users
--   FOR INSERT WITH CHECK (true);

-- Política para permitir que usuários vejam apenas seus próprios dados
-- CREATE POLICY "Users can view own data" ON users
--   FOR SELECT USING (auth.uid()::text = id::text);

-- Política para permitir que usuários atualizem seus próprios dados
-- CREATE POLICY "Users can update own data" ON users
--   FOR UPDATE USING (auth.uid()::text = id::text);

-- 3. Verificar se RLS está desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 4. Testar inserção de usuário
-- (Execute o endpoint de register após executar este script)

-- 5. Para reabilitar RLS no futuro (quando implementar autenticação completa):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow insert for new users" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
-- CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
