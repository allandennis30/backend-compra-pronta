-- Script para atualizar as senhas dos usuários de teste
-- Execute este script no SQL Editor do Supabase para corrigir as senhas

-- Atualizar senhas dos clientes
UPDATE clients 
SET senha = '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK'
WHERE email IN ('maria@cliente.com', 'ana@cliente.com');

-- Atualizar senhas dos vendedores
UPDATE sellers 
SET senha = '$2a$12$sa6/X81GyVLoEQyffWjnNOAnuGA/yPb.tGLpV3xtRJE4LpVg5l0mK'
WHERE email IN ('joao@vendedor.com', 'carlos@vendedor.com');

-- Verificar se as atualizações foram feitas
SELECT 'Clientes atualizados:' as info, COUNT(*) as total FROM clients WHERE email IN ('maria@cliente.com', 'ana@cliente.com');
SELECT 'Vendedores atualizados:' as info, COUNT(*) as total FROM sellers WHERE email IN ('joao@vendedor.com', 'carlos@vendedor.com');

-- Mostrar os usuários de teste disponíveis
SELECT 'CLIENTES DE TESTE:' as tipo, nome, email FROM clients WHERE email LIKE '%@cliente.com'
UNION ALL
SELECT 'VENDEDORES DE TESTE:' as tipo, nome, email FROM sellers WHERE email LIKE '%@vendedor.com';

SELECT 'SENHA PARA TODOS OS USUÁRIOS DE TESTE: senha123' as info;