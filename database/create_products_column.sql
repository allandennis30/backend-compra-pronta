-- Script para adicionar coluna de produtos na tabela de usuários
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna products_ids na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS products_ids TEXT[] DEFAULT '{}';

-- Criar índice para melhor performance na busca
CREATE INDEX IF NOT EXISTS idx_users_products_ids ON users USING GIN (products_ids);

-- Função para adicionar produto ao usuário
CREATE OR REPLACE FUNCTION add_product_to_user(user_id UUID, product_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET products_ids = array_append(products_ids, product_id)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para remover produto do usuário
CREATE OR REPLACE FUNCTION remove_product_from_user(user_id UUID, product_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET products_ids = array_remove(products_ids, product_id)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para obter produtos do usuário
CREATE OR REPLACE FUNCTION get_user_products(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    product_ids TEXT[];
BEGIN
    SELECT products_ids INTO product_ids
    FROM users
    WHERE id = user_id;
    
    RETURN COALESCE(product_ids, '{}');
END;
$$ LANGUAGE plpgsql;

-- Verificar se a coluna foi criada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'products_ids';

-- Verificar as funções criadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('add_product_to_user', 'remove_product_from_user', 'get_user_products')
AND routine_schema = 'public';

