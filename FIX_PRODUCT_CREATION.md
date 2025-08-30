# 🛠️ Correção: Erro de Criação de Produtos

## 🔍 Problema Identificado

O erro `"new row violates row-level security policy for table 'products'"` acontece porque:

1. As políticas RLS (Row Level Security) esperam usar `auth.uid()` do Supabase Auth
2. Estamos usando JWT customizado em vez do Supabase Auth
3. A configuração está usando chave `anon` em vez de `service_role`

## 🎯 Soluções Implementadas

### 1. Script SQL para Corrigir RLS

Execute o arquivo `fix_products_rls.sql` no SQL Editor do Supabase:

```sql
-- Remove políticas RLS conflitantes
DROP POLICY IF EXISTS "Vendedores podem inserir seus próprios produtos" ON products;
-- Desabilita RLS na tabela products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

### 2. Configuração do Ambiente

Adicione a chave de service role no seu arquivo `.env`:

```env
# Configuração Supabase
SUPABASE_URL=https://feljoannoghnpbqhrsuv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbGpvYW5ub2dobnBicWhyc3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjY3ODUsImV4cCI6MjA3MDIwMjc4NX0.uIrk_RMpPaaR2EXSU2YZ-nHvj2Ez5_Wl-3sETF9Tupg

# ADICIONE ESTA LINHA com a service role key:
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 3. Como Obter a Service Role Key

1. Vá para [supabase.com](https://supabase.com)
2. Acesse seu projeto
3. Vá em **Settings** → **API**
4. Copie a **service_role secret** (não a anon public!)

### 4. Para Produção (Render)

No painel do Render, adicione as variáveis de ambiente:

```
SUPABASE_SERVICE_ROLE_KEY = sua_service_role_key_aqui
```

## 🔧 Passos para Executar a Correção

### Passo 1: Executar Script SQL
```sql
-- Execute fix_products_rls.sql no SQL Editor do Supabase
```

### Passo 2: Atualizar Ambiente Local
```bash
# Adicione SUPABASE_SERVICE_ROLE_KEY no arquivo .env
# Reinicie o servidor
npm run dev
```

### Passo 3: Atualizar Produção
```bash
# No painel do Render:
# Environment → Add Environment Variable
# Name: SUPABASE_SERVICE_ROLE_KEY
# Value: sua_service_role_key
```

## ✅ Verificação

Após aplicar as correções, você deve ver no log do servidor:

```
🔧 [SUPABASE] Conectando com: {
  url: "https://feljoannoghnpbqhrsuv.supabase.co",
  keyType: "service_role",
  keyPreview: "eyJhbGciOiJIUzI1NiIsI..."
}
```

## 🎯 Resultado Esperado

- ✅ Criação de produtos funcionando
- ✅ RLS não interferindo nas operações
- ✅ Segurança mantida no nível da aplicação (middleware de autenticação)

## 🔄 Alternativas Futuras

1. **Migrar para Supabase Auth**: Substituir JWT customizado por Supabase Auth
2. **Reabilitar RLS**: Criar políticas personalizadas que funcionem com JWT
3. **Híbrido**: Usar service role para operações e anon para consultas públicas
