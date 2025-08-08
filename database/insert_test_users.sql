-- Inserir usuários de teste no Supabase
-- Execute este script no SQL Editor do Supabase após criar a tabela users

-- Inserir usuários de teste
INSERT INTO users (nome, email, senha, tipo, telefone, cnpj, nome_empresa, endereco) VALUES
('João Silva', 'joao@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 99999-9999', '12.345.678/0001-90', 'Supermercado Silva', '{"rua": "Rua das Flores, 123", "bairro": "Centro", "cidade": "São Paulo", "cep": "01234-567", "estado": "SP"}'),
('Maria Santos', 'maria@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 88888-8888', NULL, NULL, '{"rua": "Av. Paulista, 1000", "bairro": "Bela Vista", "cidade": "São Paulo", "cep": "01310-100", "estado": "SP"}'),
('Carlos Oliveira', 'carlos@vendedor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'vendedor', '(11) 77777-7777', '98.765.432/0001-10', 'Mercado Oliveira', '{"rua": "Rua Augusta, 456", "bairro": "Consolação", "cidade": "São Paulo", "cep": "01305-000", "estado": "SP"}'),
('Ana Costa', 'ana@cliente.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', 'cliente', '(11) 66666-6666', NULL, NULL, '{"rua": "Rua Oscar Freire, 789", "bairro": "Jardins", "cidade": "São Paulo", "cep": "01426-001", "estado": "SP"}');

-- Verificar se os usuários foram inseridos
SELECT nome, email, tipo FROM users;

-- INFORMAÇÕES IMPORTANTES:
-- Todos os usuários de teste têm a senha: "senha123"
-- Hash da senha: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm
-- 
-- Usuários para teste:
-- maria@cliente.com - senha: senha123 (cliente)
-- ana@cliente.com - senha: senha123 (cliente)
-- joao@vendedor.com - senha: senha123 (vendedor)
-- carlos@vendedor.com - senha: senha123 (vendedor)