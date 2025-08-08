# Configuração de Variáveis de Ambiente no Render

## ❌ Problema Identificado

O deploy no Render está falando com o erro:
```
Error: supabaseUrl is required.
```

Isso acontece porque o arquivo `.env` está sendo ignorado pelo Git (listado no `.gitignore`), então as variáveis de ambiente não são enviadas para o Render.

## ✅ Solução: Configurar Variáveis no Painel do Render

### 1. Acesse o Painel do Render
1. Vá para: https://dashboard.render.com
2. Selecione o serviço: `backend-compra-pronta`
3. Clique na aba **"Environment"**

### 2. Adicione as Variáveis de Ambiente

Clique em **"Add Environment Variable"** e adicione cada uma das seguintes variáveis:

#### Variáveis Obrigatórias do Supabase
```
SUPABASE_URL = https://feljoannoghnpbqhrsuv.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbGpvYW5ub2dobnBicWhyc3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjY3ODUsImV4cCI6MjA3MDIwMjc4NX0.uIrk_RMpPaaR2EXSU2YZ-nHvj2Ez5_Wl-3sETF9Tupg
```

#### Variáveis Existentes (já configuradas)
```
PORT = 3000
NODE_ENV = production
JWT_SECRET = sua_chave_secreta_super_segura_aqui_mude_em_producao_123456789
JWT_EXPIRES_IN = 24h
BCRYPT_ROUNDS = 12
ALLOWED_ORIGINS = http://localhost:3000,http://localhost:8080
```

### 3. Salvar e Fazer Redeploy

1. Clique em **"Save Changes"**
2. O Render fará automaticamente um novo deploy
3. Aguarde o deploy completar

## 📋 Lista Completa de Variáveis

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `SUPABASE_URL` | `https://feljoannoghnpbqhrsuv.supabase.co` | URL do projeto Supabase |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Chave anon/public do Supabase |
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | `production` | Ambiente de execução |
| `JWT_SECRET` | `sua_chave_secreta_super_segura_aqui_mude_em_producao_123456789` | Chave secreta para JWT |
| `JWT_EXPIRES_IN` | `24h` | Tempo de expiração do token |
| `BCRYPT_ROUNDS` | `12` | Rounds do bcrypt para hash de senhas |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:8080` | Origens permitidas para CORS |

## 🔍 Verificação

Após configurar as variáveis, verifique se o deploy foi bem-sucedido:

### 1. Health Check
```bash
curl https://backend-compra-pronta.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-08T...",
  "uptime": 123.456
}
```

### 2. Teste de Login
```bash
curl -X POST https://backend-compra-pronta.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@cliente.com", "senha": "senha123"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nome": "Maria Santos",
    "email": "maria@cliente.com",
    "tipo": "cliente"
  }
}
```

## 🚨 Importante

1. **Nunca commite o arquivo `.env`** - Ele deve permanecer no `.gitignore`
2. **Use sempre o painel do Render** para configurar variáveis sensíveis
3. **Teste após cada mudança** para garantir que tudo funciona
4. **Mantenha as chaves seguras** - Não compartilhe em repositórios públicos

## 📝 Próximos Passos

1. ✅ **Configurar variáveis no Render** (seguir este guia)
2. ⏳ **Aguardar redeploy automático**
3. ✅ **Executar script SQL no Supabase** (se ainda não foi feito)
4. ✅ **Testar integração completa**

## 🔧 Troubleshooting

### Erro: "supabaseUrl is required"
- **Causa**: Variáveis SUPABASE_URL ou SUPABASE_KEY não configuradas
- **Solução**: Seguir este guia para configurar no painel do Render

### Erro: "relation 'users' does not exist"
- **Causa**: Tabela não foi criada no Supabase
- **Solução**: Executar o script `backend/database/create_tables.sql` no SQL Editor do Supabase

### Deploy continua falhando
- **Verificar**: Se todas as variáveis foram salvas corretamente
- **Aguardar**: O Render pode levar alguns minutos para aplicar as mudanças
- **Logs**: Verificar os logs do deploy no painel do Render