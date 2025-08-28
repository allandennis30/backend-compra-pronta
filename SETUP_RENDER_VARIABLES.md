# 🔧 Configuração das Variáveis de Ambiente no Render

## ❌ Problema Atual
O backend está retornando erro 500 no endpoint de login porque as variáveis de ambiente não estão configuradas.

## ✅ Solução: Configurar Variáveis no Painel do Render

### 1. Acesse o Painel do Render
1. Vá para: https://dashboard.render.com
2. Selecione o serviço: `backend-compra-pronta`
3. Clique na aba **"Environment"**

### 2. Adicione as Variáveis Obrigatórias

Clique em **"Add Environment Variable"** e adicione cada uma:

#### 🔑 **SUPABASE_URL**
```
Key: SUPABASE_URL
Value: https://feljoannoghnpbqhrsuv.supabase.co
```

#### 🔑 **SUPABASE_KEY**
```
Key: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbGpvYW5ub2dobnBicWhyc3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjY3ODUsImV4cCI6MjA3MDIwMjc4NX0.uIrk_RMpPaaR2EXSU2YZ-nHvj2Ez5_Wl-3sETF9Tupg
```

#### 🔑 **JWT_SECRET**
```
Key: JWT_SECRET
Value: sua_chave_secreta_super_segura_aqui_mude_em_producao_123456789
```

#### 🔑 **JWT_EXPIRES_IN**
```
Key: JWT_EXPIRES_IN
Value: 24h
```

#### 🔑 **BCRYPT_ROUNDS**
```
Key: BCRYPT_ROUNDS
Value: 12
```

#### 🔑 **ALLOWED_ORIGINS**
```
Key: ALLOWED_ORIGINS
Value: http://localhost:3000,http://localhost:8080,http://localhost:3001
```

### 3. Salvar e Aguardar Redeploy

1. Clique em **"Save Changes"**
2. O Render fará automaticamente um novo deploy
3. Aguarde o deploy completar (pode levar alguns minutos)

### 4. Verificar se Funcionou

Após o deploy, teste:

```bash
# Health check
curl https://backend-compra-pronta.onrender.com/health

# Login (deve funcionar agora)
curl -X POST https://backend-compra-pronta.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@vendedor.com", "senha": "senha123"}'
```

## 🚨 Importante

- **NUNCA commite o arquivo .env** - Ele deve permanecer no .gitignore
- **Use sempre o painel do Render** para configurar variáveis sensíveis
- **Teste após cada mudança** para garantir que tudo funciona
- **Mantenha as chaves seguras** - Não compartilhe em repositórios públicos

## 🔍 Troubleshooting

### Erro: "supabaseUrl is required"
- **Causa**: Variáveis SUPABASE_URL ou SUPABASE_KEY não configuradas
- **Solução**: Seguir este guia para configurar no painel do Render

### Deploy continua falhando
- **Verificar**: Se todas as variáveis foram salvas corretamente
- **Aguardar**: O Render pode levar alguns minutos para aplicar as mudanças
- **Logs**: Verificar os logs do deploy no painel do Render
