-- Script para criar tabela unificada de usuários com campo isSeller
-- Execute este script no SQL Editor do Supabase

-- Criar tabela users unificada
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  nome_empresa VARCHAR(255),
  endereco JSONB DEFAULT '{}',
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  isSeller BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON users(ativo);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj);
CREATE INDEX IF NOT EXISTS idx_users_isSeller ON users(isSeller);

-- Criar função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar data_atualizacao (remover se já existir)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at_column();

-- Nota: As tabelas clients e sellers foram substituídas pela tabela users unificada
-- Se você tiver dados nas tabelas antigas, use o script migrate_to_unified_users.sql

-- Inserir usuários de teste com senhas corretas
INSERT INTO users (nome, email, senha, telefone, cpf, endereco, isSeller) VALUES
('Maria Santos', 'maria@cliente.com', '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK', '(11) 88888-8888', '123.456.789-01', '{"rua": "Av. Paulista, 1000", "bairro": "Bela Vista", "cidade": "São Paulo", "cep": "01310-100", "estado": "SP"}', false),
('Ana Costa', 'ana@cliente.com', '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK', '(11) 66666-6666', '987.654.321-09', '{"rua": "Rua Oscar Freire, 789", "bairro": "Jardins", "cidade": "São Paulo", "cep": "01426-001", "estado": "SP"}', false),
('João Silva', 'joao@vendedor.com', '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK', '(11) 99999-9999', NULL, '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "São Paulo", "cep": "01234-567", "estado": "SP"}', true),
('Carlos Oliveira', 'carlos@vendedor.com', '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK', '(11) 77777-7777', NULL, '{"rua": "Rua Augusta, 456", "bairro": "Consolação", "cidade": "São Paulo", "cep": "01305-000", "estado": "SP"}', true)
ON CONFLICT (email) DO UPDATE SET
  senha = EXCLUDED.senha,
  isSeller = EXCLUDED.isSeller;

-- Atualizar vendedores com CNPJ e nome da empresa
UPDATE users SET 
  cnpj = '12.345.678/0001-90',
  nome_empresa = 'Supermercado Silva'
WHERE email = 'joao@vendedor.com';

UPDATE users SET 
  cnpj = '98.765.432/0001-10',
  nome_empresa = 'Mercado Oliveira'
WHERE email = 'carlos@vendedor.com';

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verificar dados migrados
SELECT 'USUÁRIOS MIGRADOS:' as info;
SELECT 
  CASE WHEN isSeller THEN 'VENDEDOR' ELSE 'CLIENTE' END as tipo,
  nome, 
  email,
  CASE WHEN cnpj IS NOT NULL THEN cnpj ELSE cpf END as documento
FROM users 
ORDER BY isSeller DESC, nome;

SELECT 'SENHA PARA TODOS OS USUÁRIOS DE TESTE: senha123' as info;