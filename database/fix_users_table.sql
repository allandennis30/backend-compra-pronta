-- Script para corrigir a tabela users existente
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar a coluna 'tipo' que está faltando
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'cliente';

-- 2. Adicionar constraint para valores válidos
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS check_tipo 
CHECK (tipo IN ('cliente', 'vendedor'));

-- 3. Atualizar usuários existentes para terem um tipo padrão
UPDATE users 
SET tipo = 'cliente' 
WHERE tipo IS NULL OR tipo = '';

-- 4. Tornar a coluna NOT NULL após atualizar todos os registros
ALTER TABLE users 
ALTER COLUMN tipo SET NOT NULL;

-- 5. Criar índice na coluna tipo se não existir
CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo);

-- 6. Verificar se a estrutura está correta
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 7. Verificar se há usuários na tabela
SELECT COUNT(*) as total_users FROM users;

-- 8. Verificar tipos de usuários
SELECT tipo, COUNT(*) as quantidade 
FROM users 
GROUP BY tipo;
