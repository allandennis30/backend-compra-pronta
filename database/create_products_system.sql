-- Script completo para criar sistema de produtos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category VARCHAR(50) NOT NULL,
    barcode VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    is_sold_by_weight BOOLEAN NOT NULL DEFAULT false,
    price_per_kg DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. Criar constraint única para código de barras por vendedor
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_seller_barcode ON products(seller_id, barcode);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para produtos
-- Vendedores podem ver apenas seus próprios produtos
CREATE POLICY "Vendedores podem ver seus próprios produtos" ON products
    FOR SELECT USING (seller_id = auth.uid());

-- Vendedores podem inserir seus próprios produtos
CREATE POLICY "Vendedores podem inserir seus próprios produtos" ON products
    FOR INSERT WITH CHECK (seller_id = auth.uid());

-- Vendedores podem atualizar seus próprios produtos
CREATE POLICY "Vendedores podem atualizar seus próprios produtos" ON products
    FOR UPDATE USING (seller_id = auth.uid());

-- Vendedores podem deletar seus próprios produtos
CREATE POLICY "Vendedores podem deletar seus próprios produtos" ON products
    FOR DELETE USING (seller_id = auth.uid());

-- Clientes podem ver produtos disponíveis de todos os vendedores
CREATE POLICY "Clientes podem ver produtos disponíveis" ON products
    FOR SELECT USING (is_available = true);

-- 6. Adicionar coluna products_ids na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS products_ids TEXT[] DEFAULT '{}';

-- 7. Criar índice para melhor performance na busca
CREATE INDEX IF NOT EXISTS idx_users_products_ids ON users USING GIN (products_ids);

-- 8. Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_products_updated_at_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- 10. Função para adicionar produto ao usuário
CREATE OR REPLACE FUNCTION add_product_to_user(user_id UUID, product_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET products_ids = array_append(products_ids, product_id)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para remover produto do usuário
CREATE OR REPLACE FUNCTION remove_product_from_user(user_id UUID, product_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET products_ids = array_remove(products_ids, product_id)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Função para obter produtos do usuário
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

-- 13. Trigger para adicionar produto ao usuário automaticamente
CREATE OR REPLACE FUNCTION add_product_to_user_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_product_to_user(NEW.seller_id, NEW.id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_product_to_user_trigger
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION add_product_to_user_trigger();

-- 14. Trigger para remover produto do usuário automaticamente
CREATE OR REPLACE FUNCTION remove_product_from_user_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM remove_product_from_user(OLD.seller_id, OLD.id::TEXT);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remove_product_from_user_trigger
    AFTER DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION remove_product_from_user_trigger();

-- 15. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela products' as item,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'products'

UNION ALL

SELECT 
    'Coluna products_ids em users' as item,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'products_ids'

UNION ALL

SELECT 
    'Políticas RLS' as item,
    COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'products'

UNION ALL

SELECT 
    'Funções criadas' as item,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name IN ('add_product_to_user', 'remove_product_from_user', 'get_user_products', 'update_products_updated_at', 'add_product_to_user_trigger', 'remove_product_from_user_trigger')
AND routine_schema = 'public';

