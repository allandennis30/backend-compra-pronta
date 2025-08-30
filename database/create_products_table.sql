-- Criar tabela de produtos
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Criar constraint única para código de barras por vendedor
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_seller_barcode ON products(seller_id, barcode);

-- Habilitar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos
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

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_products_updated_at_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

