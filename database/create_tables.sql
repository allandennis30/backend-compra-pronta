-- Criação da tabela de usuários no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'vendedor')),
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  nome_empresa VARCHAR(255),
  endereco JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON users(ativo);

-- Criar função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar data_atualizacao
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuários de teste
INSERT INTO users (nome, email, senha, tipo, telefone, cnpj, nome_empresa, endereco) VALUES
('João Silva', 'joao@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 99999-9999', '12.345.678/0001-90', 'Supermercado Silva', '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "São Paulo", "cep": "01234-567", "estado": "SP"}'),
('Maria Santos', 'maria@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 88888-8888', NULL, NULL, '{"rua": "Av. Paulista, 1000", "bairro": "Bela Vista", "cidade": "São Paulo", "cep": "01310-100", "estado": "SP"}'),
('Carlos Oliveira', 'carlos@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 77777-7777', '98.765.432/0001-10', 'Mercado Oliveira', '{"rua": "Rua Augusta, 456", "bairro": "Consolação", "cidade": "São Paulo", "cep": "01305-000", "estado": "SP"}'),
('Ana Costa', 'ana@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 66666-6666', NULL, NULL, '{"rua": "Rua Oscar Freire, 789", "bairro": "Jardins", "cidade": "São Paulo", "cep": "01426-001", "estado": "SP"}');

-- Habilitar RLS (Row Level Security) - opcional
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
-- (descomente se quiser usar RLS)
-- CREATE POLICY "Users can view own data" ON users
--   FOR SELECT USING (auth.uid()::text = id::text);

-- CREATE POLICY "Users can update own data" ON users
--   FOR UPDATE USING (auth.uid()::text = id::text);