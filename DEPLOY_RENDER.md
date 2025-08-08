# Deploy no Render - Backend Compra Pronta

## 🚀 Configuração para Deploy

### 1. Preparação do Repositório

O backend já está configurado com:
- ✅ `package.json` com script de build
- ✅ `render.yaml` para configuração automática
- ✅ Estrutura de projeto otimizada

### 2. Deploy no Render

#### Opção A: Deploy Automático (Recomendado)
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em "New" → "Blueprint"
4. Conecte o repositório `backend-compra-pronta`
5. O Render detectará automaticamente o `render.yaml`
6. Clique em "Apply" para iniciar o deploy

#### Opção B: Deploy Manual
1. Acesse [render.com](https://render.com)
2. Clique em "New" → "Web Service"
3. Conecte o repositório `backend-compra-pronta`
4. Configure:
   - **Name**: `backend-compra-pronta`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Render:

```
NODE_ENV=production
JWT_SECRET=[Render gerará automaticamente]
JWT_EXPIRES_IN=24h
BCrypt_ROUNDS=12
PORT=10000
ALLOWED_ORIGINS=https://seu-frontend-domain.com
```

### 4. Verificação do Deploy

Após o deploy:
1. Acesse a URL fornecida pelo Render
2. Teste o endpoint: `https://sua-app.onrender.com/health`
3. Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 5. Endpoints Disponíveis

- `GET /health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/profile` - Perfil do usuário
- `GET /api/auth/users` - Listar usuários (requer auth)
- `POST /api/auth/logout` - Logout

### 6. Usuários de Teste

**Vendedor:**
- Email: `vendedor@teste.com`
- Senha: `123456`

**Cliente:**
- Email: `cliente@teste.com`
- Senha: `123456`

### 7. Integração com Flutter

No seu app Flutter, use a URL do Render:
```dart
class ApiConstants {
  static const String baseUrl = 'https://sua-app.onrender.com';
  static const String loginEndpoint = '/api/auth/login';
  // ... outros endpoints
}
```

### 8. Monitoramento

- **Logs**: Disponíveis no painel do Render
- **Métricas**: CPU, memória e requests
- **Health Check**: Automático via `/health`

### 9. Troubleshooting

#### Build Failed
- Verifique se `npm install` está funcionando
- Confirme se todas as dependências estão no `package.json`

#### Start Failed
- Verifique se a porta está configurada corretamente
- Confirme se as variáveis de ambiente estão definidas

#### 503 Service Unavailable
- Aguarde alguns minutos (cold start)
- Verifique os logs para erros

### 10. Próximos Passos

1. ✅ Deploy realizado
2. 🔄 Configurar domínio customizado (opcional)
3. 🔄 Configurar SSL (automático no Render)
4. 🔄 Integrar com frontend Flutter
5. 🔄 Configurar CI/CD (automático via GitHub)

---

**Nota**: O plano gratuito do Render pode ter limitações de CPU e "sleep" após inatividade. Para produção, considere um plano pago.