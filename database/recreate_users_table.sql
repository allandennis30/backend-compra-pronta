-- Script para recriar completamente a tabela users
-- Execute este script no SQL Editor do Supabase

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS users_backup AS 
SELECT * FROM users;

-- 2. Dropar a tabela atual
DROP TABLE IF EXISTS users CASCADE;

-- 3. Recriar a tabela com a estrutura correta
CREATE TABLE users (
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
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tipo ON users(tipo);
CREATE INDEX idx_users_ativo ON users(ativo);

-- 5. Criar função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para atualizar data_atualizacao
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Inserir usuários de teste
INSERT INTO users (nome, email, senha, tipo, telefone, cnpj, nome_empresa, endereco) VALUES
('João Silva', 'joao@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 99999-9999', '12.345.678/0001-90', 'Supermercado Silva', '{"street": "Rua das Flores", "number": "123", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}'),
('Maria Santos', 'maria@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 88888-8888', NULL, NULL, '{"street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}'),
('Carlos Oliveira', 'carlos@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 77777-7777', '98.765.432/0001-10', 'Mercado Oliveira', '{"street": "Rua Augusta", "number": "456", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zipCode": "01305-000"}'),
('Ana Costa', 'ana@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 66666-6666', NULL, NULL, '{"street": "Rua Oscar Freire", "number": "789", "neighborhood": "Jardins", "city": "São Paulo", "state": "SP", "zipCode": "01426-001"}');

-- 8. Habilitar RLS (Row Level Security) - opcional
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Verificar se a estrutura está correta
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 10. Verificar se há usuários na tabela
SELECT COUNT(*) as total_users FROM users;

-- 11. Verificar tipos de usuários
SELECT tipo, COUNT(*) as quantidade 
FROM users 
GROUP BY tipo;

-- 12. Verificar um usuário específico
SELECT id, nome, email, tipo, telefone, ativo 
FROM users 
WHERE email = 'joao@vendedor.com';
