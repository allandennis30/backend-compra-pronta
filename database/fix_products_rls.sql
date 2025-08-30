-- Script para corrigir RLS da tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas RLS existentes da tabela products
DROP POLICY IF EXISTS "Vendedores podem ver seus próprios produtos" ON products;
DROP POLICY IF EXISTS "Vendedores podem inserir seus próprios produtos" ON products;
DROP POLICY IF EXISTS "Vendedores podem atualizar seus próprios produtos" ON products;
DROP POLICY IF EXISTS "Vendedores podem deletar seus próprios produtos" ON products;
DROP POLICY IF EXISTS "Clientes podem ver produtos disponíveis" ON products;

-- 2. Desabilitar RLS na tabela products
-- Como estamos usando JWT personalizado e não Supabase Auth,
-- o auth.uid() não funciona corretamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- 4. Verificar estrutura da tabela
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- NOTA: Como alternativa futura, você pode:
-- A) Implementar autenticação Supabase Auth em vez de JWT customizado
-- B) Usar service role key no backend para operações de produtos
-- C) Implementar validação de permissões no nível da aplicação (atual)

-- Para reabilitar RLS no futuro com Supabase Auth:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Vendedores podem ver seus próprios produtos" ON products
--     FOR SELECT USING (seller_id = auth.uid());
-- CREATE POLICY "Vendedores podem inserir seus próprios produtos" ON products
--     FOR INSERT WITH CHECK (seller_id = auth.uid());
-- CREATE POLICY "Vendedores podem atualizar seus próprios produtos" ON products
--     FOR UPDATE USING (seller_id = auth.uid());
-- CREATE POLICY "Vendedores podem deletar seus próprios produtos" ON products
--     FOR DELETE USING (seller_id = auth.uid());
-- CREATE POLICY "Clientes podem ver produtos disponíveis" ON products
--     FOR SELECT USING (is_available = true);
