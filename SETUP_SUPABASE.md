# Configuração do Supabase para o Compra Pronta

## 1. Configuração Inicial

### Credenciais do Projeto
- **URL do Projeto**: `https://feljoannoghnpbqhrsuv.supabase.co`
- **Chave Anon/Public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbGpvYW5ub2dobnBicWhyc3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjY3ODUsImV4cCI6MjA3MDIwMjc4NX0.uIrk_RMpPaaR2EXSU2YZ-nHvj2Ez5_Wl-3sETF9Tupg`

### Variáveis de Ambiente
As seguintes variáveis foram adicionadas ao arquivo `.env`:
```env
SUPABASE_URL=https://feljoannoghnpbqhrsuv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbGpvYW5ub2dobnBicWhyc3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjY3ODUsImV4cCI6MjA3MDIwMjc4NX0.uIrk_RMpPaaR2EXSU2YZ-nHvj2Ez5_Wl-3sETF9Tupg
```

## 2. Configuração do Banco de Dados

### Executar Script SQL
1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o projeto: `feljoannoghnpbqhrsuv`
3. No menu lateral, clique em "SQL Editor"
4. Execute o script localizado em `backend/database/create_tables.sql`

### Estrutura da Tabela Users
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'cliente',
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  nome_empresa VARCHAR(255),
  endereco JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Usuários de Teste

Os seguintes usuários de teste serão criados automaticamente:

### Vendedores
1. **João Silva**
   - Email: `joao@vendedor.com`
   - Senha: `senha123`
   - Tipo: `vendedor`
   - Empresa: `Supermercado Silva`

2. **Carlos Oliveira**
   - Email: `carlos@vendedor.com`
   - Senha: `senha123`
   - Tipo: `vendedor`
   - Empresa: `Mercado Oliveira`

### Clientes
1. **Maria Santos**
   - Email: `maria@cliente.com`
   - Senha: `senha123`
   - Tipo: `cliente`

2. **Ana Costa**
   - Email: `ana@cliente.com`
   - Senha: `senha123`
   - Tipo: `cliente`

## 4. Instalação de Dependências

```bash
cd backend
npm install
```

A dependência `@supabase/supabase-js` foi adicionada ao `package.json`.

## 5. Arquivos Modificados

### Novos Arquivos
- `backend/config/supabase.js` - Configuração do cliente Supabase
- `backend/database/create_tables.sql` - Script de criação das tabelas
- `backend/SETUP_SUPABASE.md` - Esta documentação

### Arquivos Modificados
- `backend/package.json` - Adicionada dependência do Supabase
- `backend/.env` - Adicionadas variáveis de ambiente
- `backend/models/User.js` - Substituído modelo mockado por integração com Supabase

## 6. Testando a Integração

### Verificar Conexão
```bash
node -e "const supabase = require('./config/supabase'); console.log('Supabase conectado:', !!supabase);"
```

### Testar Login
Use as credenciais de teste no aplicativo Flutter ou via API:
```bash
curl -X POST https://backend-compra-pronta.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@cliente.com", "senha": "senha123"}'
```

## 7. Próximos Passos

1. **Executar o script SQL** no painel do Supabase
2. **Instalar dependências** com `npm install`
3. **Testar a aplicação** com as credenciais fornecidas
4. **Configurar RLS** (Row Level Security) se necessário
5. **Adicionar mais tabelas** conforme a evolução do projeto

## 8. Vantagens do Supabase

- ✅ **PostgreSQL completo** com todas as funcionalidades
- ✅ **Plano gratuito generoso** (500MB de DB, 50MB de storage)
- ✅ **Interface web** para gerenciamento
- ✅ **Backup automático**
- ✅ **Escalabilidade** conforme crescimento
- ✅ **Autenticação integrada** (para futuras implementações)
- ✅ **Real-time subscriptions**
- ✅ **Storage para arquivos**

## 9. Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o script SQL foi executado
- Teste a conectividade com o Supabase

### Erro de Autenticação
- Verifique se a chave do Supabase está correta
- Confirme se o projeto está ativo no painel

### Erro de Tabela
- Execute o script `create_tables.sql` no SQL Editor
- Verifique se a tabela `users` foi criada corretamente