-- Script para migrar dados das tabelas clients e sellers para a nova tabela users
-- Execute este script no SQL Editor do Supabase APÓS executar create_unified_users_table.sql

-- Verificar se as tabelas antigas existem
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        RAISE NOTICE 'Tabela clients encontrada, iniciando migração...';
        
        -- Migrar clientes (isSeller = false)
        INSERT INTO users (nome, email, senha, telefone, cpf, endereco, latitude, longitude, isSeller, ativo, data_criacao)
        SELECT nome, email, senha, telefone, cpf, endereco, latitude, longitude, false, ativo, data_criacao
        FROM clients
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = clients.email);
        
        RAISE NOTICE 'Clientes migrados com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela clients não encontrada.';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sellers') THEN
        RAISE NOTICE 'Tabela sellers encontrada, iniciando migração...';
        
        -- Migrar vendedores (isSeller = true)
        INSERT INTO users (nome, email, senha, telefone, cnpj, nome_empresa, endereco, latitude, longitude, isSeller, ativo, data_criacao)
        SELECT nome, email, senha, telefone, cnpj, nome_empresa, endereco, latitude, longitude, true, ativo, data_criacao
        FROM sellers
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = sellers.email);
        
        RAISE NOTICE 'Vendedores migrados com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela sellers não encontrada.';
    END IF;
END $$;

-- Verificar dados migrados
SELECT 'RESUMO DA MIGRAÇÃO:' as info;
SELECT 
  CASE WHEN isSeller THEN 'VENDEDOR' ELSE 'CLIENTE' END as tipo,
  COUNT(*) as quantidade
FROM users 
GROUP BY isSeller
ORDER BY isSeller DESC;

SELECT 'USUÁRIOS MIGRADOS:' as info;
SELECT 
  CASE WHEN isSeller THEN 'VENDEDOR' ELSE 'CLIENTE' END as tipo,
  nome, 
  email,
  CASE WHEN cnpj IS NOT NULL THEN cnpj ELSE cpf END as documento
FROM users 
ORDER BY isSeller DESC, nome;

-- Opcional: Remover tabelas antigas após confirmar que a migração foi bem-sucedida
-- DESCOMENTE AS LINHAS ABAIXO APENAS APÓS VERIFICAR QUE TUDO ESTÁ FUNCIONANDO
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS sellers CASCADE;

SELECT 'MIGRAÇÃO CONCLUÍDA! Verifique os dados acima antes de remover as tabelas antigas.' as info;