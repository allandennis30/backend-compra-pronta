-- Script de migração para separar usuários em clientes e vendedores
-- Execute este script no SQL Editor do Supabase

-- ATENÇÃO: Este script irá migrar dados da tabela 'users' para as novas tabelas 'clients' e 'sellers'
-- Certifique-se de fazer backup dos dados antes de executar

-- 1. Criar as novas tabelas (se ainda não existirem)
-- Execute primeiro o arquivo create_tables.sql

-- 2. Migrar dados existentes da tabela users (se existir)
DO $$
BEGIN
    -- Verificar se a tabela users existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        
        -- Migrar clientes
        INSERT INTO clients (id, nome, email, senha, telefone, cpf, endereco, latitude, longitude, ativo, data_criacao, data_atualizacao)
        SELECT 
            id,
            nome,
            email,
            senha,
            telefone,
            cpf,
            endereco,
            latitude,
            longitude,
            ativo,
            data_criacao,
            data_atualizacao
        FROM users 
        WHERE tipo = 'cliente'
        ON CONFLICT (id) DO NOTHING;
        
        -- Migrar vendedores
        INSERT INTO sellers (id, nome, email, senha, telefone, cnpj, nome_empresa, endereco, latitude, longitude, ativo, data_criacao, data_atualizacao)
        SELECT 
            id,
            nome,
            email,
            senha,
            telefone,
            cnpj,
            nome_empresa,
            endereco,
            latitude,
            longitude,
            ativo,
            data_criacao,
            data_atualizacao
        FROM users 
        WHERE tipo = 'vendedor'
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Migração concluída. Dados migrados das tabelas users para clients e sellers.';
        RAISE NOTICE 'IMPORTANTE: Verifique os dados migrados antes de remover a tabela users.';
        
    ELSE
        RAISE NOTICE 'Tabela users não encontrada. Migração não necessária.';
    END IF;
END $$;

-- 3. Verificar dados migrados
SELECT 'Clientes migrados:' as info, COUNT(*) as total FROM clients;
SELECT 'Vendedores migrados:' as info, COUNT(*) as total FROM sellers;

-- 4. Comparar com dados originais (se a tabela users ainda existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        PERFORM 1;
        -- Mostrar contagem original
        RAISE NOTICE 'Dados originais na tabela users:';
        RAISE NOTICE 'Clientes: %', (SELECT COUNT(*) FROM users WHERE tipo = 'cliente');
        RAISE NOTICE 'Vendedores: %', (SELECT COUNT(*) FROM users WHERE tipo = 'vendedor');
    END IF;
END $$;

-- 5. OPCIONAL: Remover tabela users antiga (DESCOMENTE APENAS APÓS VERIFICAR OS DADOS)
-- ATENÇÃO: Esta operação é irreversível!
-- DROP TABLE IF EXISTS users CASCADE;

-- 6. Criar função para buscar vendedores por proximidade (opcional)
CREATE OR REPLACE FUNCTION sellers_within_radius(
    lat DECIMAL,
    lng DECIMAL,
    radius_km DECIMAL
)
RETURNS TABLE(
    id UUID,
    nome VARCHAR,
    email VARCHAR,
    telefone VARCHAR,
    cnpj VARCHAR,
    nome_empresa VARCHAR,
    endereco JSONB,
    latitude DECIMAL,
    longitude DECIMAL,
    ativo BOOLEAN,
    data_criacao TIMESTAMP WITH TIME ZONE,
    data_atualizacao TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.nome,
        s.email,
        s.telefone,
        s.cnpj,
        s.nome_empresa,
        s.endereco,
        s.latitude,
        s.longitude,
        s.ativo,
        s.data_criacao,
        s.data_atualizacao,
        (
            6371 * acos(
                cos(radians(lat)) * 
                cos(radians(s.latitude)) * 
                cos(radians(s.longitude) - radians(lng)) + 
                sin(radians(lat)) * 
                sin(radians(s.latitude))
            )
        )::DECIMAL as distance_km
    FROM sellers s
    WHERE s.ativo = true
    AND (
        6371 * acos(
            cos(radians(lat)) * 
            cos(radians(s.latitude)) * 
            cos(radians(s.longitude) - radians(lng)) + 
            sin(radians(lat)) * 
            sin(radians(s.latitude))
        )
    ) <= radius_km
    ORDER BY distance_km;
END;
$$;

-- Comentários finais
-- Este script:
-- 1. Migra dados existentes da tabela 'users' para 'clients' e 'sellers'
-- 2. Preserva todos os dados originais
-- 3. Cria uma função para busca por proximidade geográfica
-- 4. Permite verificação antes da remoção da tabela antiga
--
-- Próximos passos:
-- 1. Execute este script
-- 2. Verifique se os dados foram migrados corretamente
-- 3. Teste as novas APIs
-- 4. Apenas após confirmação, remova a tabela 'users' antiga