# 🔧 Solução para o Erro: "column 'tipo' does not exist"

## ❌ **Problema Identificado**
```
ERROR: 42703: column "tipo" does not exist
```

A tabela `users` foi criada **sem a coluna `tipo`** que o código está tentando usar.

## ✅ **Soluções Disponíveis**

### **Opção 1: Corrigir a tabela existente (Recomendado)**
Execute o script: `backend/database/fix_users_table.sql`

### **Opção 2: Recriar a tabela completamente**
Execute o script: `backend/database/recreate_users_table.sql`

### **Opção 3: Corrigir políticas de RLS (Após Opção 1 ou 2)**
Execute o script: `backend/database/fix_rls_policies.sql`

## 🚀 **Passo a Passo para Resolver**

### **1. Acesse o Supabase**
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"**

### **2. Execute os Scripts de Correção**

#### **Passo 1: Corrigir estrutura da tabela**
```sql
-- Copie e cole o conteúdo de: backend/database/recreate_users_table.sql
```

#### **Passo 2: Corrigir políticas de RLS**
```sql
-- Copie e cole o conteúdo de: backend/database/fix_rls_policies.sql
```

### **3. Verificar se funcionou**
Após executar o script, você deve ver:
- ✅ Estrutura da tabela com todas as colunas
- ✅ 4 usuários de teste inseridos
- ✅ Coluna `tipo` funcionando

## 🔍 **Verificação**

### **Teste 1: Estrutura da tabela**
```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### **Teste 2: Usuários inseridos**
```sql
SELECT id, nome, email, tipo, telefone, ativo 
FROM users;
```

### **Teste 3: Tipos de usuários**
```sql
SELECT tipo, COUNT(*) as quantidade 
FROM users 
GROUP BY tipo;
```

## 🧪 **Teste Local Após Correção**

Após corrigir o banco, teste localmente:

```bash
cd backend
node server.js
```

Em outro terminal:
```bash
# Teste de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@vendedor.com", "senha": "senha123"}'

# Teste de register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste", "email": "teste@teste.com", "senha": "senha123"}'
```

## 🎯 **Resultado Esperado**

Após a correção:
- ✅ Endpoint de login funcionando
- ✅ Endpoint de register funcionando
- ✅ Usuários sendo criados corretamente
- ✅ CRUD de autenticação 100% funcional

## 🚨 **Importante**

- **Faça backup** antes de executar os scripts
- **Execute apenas um script** (não ambos)
- **Teste localmente** antes de fazer deploy
- **Verifique se não há dados importantes** na tabela atual

## 🔄 **Próximos Passos**

1. ✅ **Corrigir estrutura do banco** (este guia)
2. ⏳ **Testar localmente**
3. ⏳ **Fazer commit das correções**
4. ⏳ **Deploy automático no Render**
5. ⏳ **Testar endpoints no Render**
