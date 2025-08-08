-- Criação das tabelas de clientes e vendedores no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela clients (clientes)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  endereco JSONB DEFAULT '{}',
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela sellers (vendedores)
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cnpj VARCHAR(18) NOT NULL,
  nome_empresa VARCHAR(255) NOT NULL,
  endereco JSONB DEFAULT '{}',
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
-- Índices para tabela clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_ativo ON clients(ativo);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- Índices para tabela sellers
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_ativo ON sellers(ativo);
CREATE INDEX IF NOT EXISTS idx_sellers_cnpj ON sellers(cnpj);

-- Criar função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar data_atualizacao
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de teste
-- Inserir clientes de teste
INSERT INTO clients (nome, email, senha, telefone, cpf, endereco) VALUES
('Maria Santos', 'maria@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', '(11) 88888-8888', '123.456.789-01', '{"rua": "Av. Paulista, 1000", "bairro": "Bela Vista", "cidade": "São Paulo", "cep": "01310-100", "estado": "SP"}'),
('Ana Costa', 'ana@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', '(11) 66666-6666', '987.654.321-09', '{"rua": "Rua Oscar Freire, 789", "bairro": "Jardins", "cidade": "São Paulo", "cep": "01426-001", "estado": "SP"}');

-- Inserir vendedores de teste
INSERT INTO sellers (nome, email, senha, telefone, cnpj, nome_empresa, endereco) VALUES
('João Silva', 'joao@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', '(11) 99999-9999', '12.345.678/0001-90', 'Supermercado Silva', '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "São Paulo", "cep": "01234-567", "estado": "SP"}'),
('Carlos Oliveira', 'carlos@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', '(11) 77777-7777', '98.765.432/0001-10', 'Mercado Oliveira', '{"rua": "Rua Augusta, 456", "bairro": "Consolação", "cidade": "São Paulo", "cep": "01305-000", "estado": "SP"}');

-- Habilitar RLS (Row Level Security) - opcional
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir que usuários vejam apenas seus próprios dados
-- (descomente se quiser usar RLS)
-- CREATE POLICY "Clients can view own data" ON clients
--   FOR SELECT USING (auth.uid()::text = id::text);

-- CREATE POLICY "Clients can update own data" ON clients
--   FOR UPDATE USING (auth.uid()::text = id::text);

-- CREATE POLICY "Sellers can view own data" ON sellers
--   FOR SELECT USING (auth.uid()::text = id::text);

-- CREATE POLICY "Sellers can update own data" ON sellers
--   FOR UPDATE USING (auth.uid()::text = id::text);