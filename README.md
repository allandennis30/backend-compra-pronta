# Backend Compra Pronta

Backend Node.js com autenticação JWT para o aplicativo Compra Pronta.

## 🚀 Funcionalidades

- ✅ Autenticação JWT segura
- ✅ Validação de dados com express-validator
- ✅ Rate limiting para proteção contra ataques
- ✅ Middleware de segurança com Helmet
- ✅ Hash de senhas com bcrypt
- ✅ CORS configurado
- ✅ Tratamento centralizado de erros
- ✅ Dados mockados para desenvolvimento
- ✅ Rotas protegidas por token

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env` e ajuste as configurações conforme necessário
   - **IMPORTANTE:** Altere a `JWT_SECRET` em produção

3. **Iniciar o servidor:**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 📚 API Endpoints

### Autenticação

#### POST `/api/auth/login`
Realiza login do usuário.

**Body:**
```json
{
  "email": "joao@vendedor.com",
  "senha": "senha123"
}
```

**Resposta de sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "nome": "João Silva",
    "email": "joao@vendedor.com",
    "tipo": "vendedor"
  },
  "expiresIn": "24h"
}
```

#### POST `/api/auth/verify`
Verifica se o token é válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "message": "Token válido",
  "user": { ... },
  "tokenInfo": {
    "id": "1",
    "email": "joao@vendedor.com",
    "tipo": "vendedor",
    "iat": "2024-01-01T10:00:00.000Z",
    "exp": "2024-01-02T10:00:00.000Z"
  }
}
```

#### POST `/api/auth/refresh`
Renova o token de acesso.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/api/auth/profile`
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/api/auth/users`
Lista todos os usuários (rota protegida).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/auth/logout`
Realiza logout (instrui o cliente a remover o token).

**Headers:**
```
Authorization: Bearer <token>
```

### Health Check

#### GET `/health`
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "uptime": 3600
}
```

## 👥 Usuários de Teste

### Vendedores
- **Email:** `joao@vendedor.com` | **Senha:** `senha123`
- **Email:** `carlos@vendedor.com` | **Senha:** `senha123`

### Clientes
- **Email:** `maria@cliente.com` | **Senha:** `senha123`
- **Email:** `ana@cliente.com` | **Senha:** `senha123`

## 🔒 Segurança

- **JWT:** Tokens com expiração configurável
- **bcrypt:** Hash de senhas com salt rounds configurável
- **Rate Limiting:** Proteção contra ataques de força bruta
- **Helmet:** Headers de segurança
- **CORS:** Configurado para origens específicas
- **Validação:** Dados validados com express-validator

## 🛠️ Estrutura do Projeto

```
backend/
├── middleware/
│   ├── auth.js          # Middleware de autenticação JWT
│   └── errorHandler.js  # Tratamento centralizado de erros
├── models/
│   └── User.js          # Modelo de usuário com dados mockados
├── routes/
│   └── auth.js          # Rotas de autenticação
├── .env                 # Variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo Git
├── package.json        # Dependências e scripts
├── README.md           # Documentação
└── server.js           # Servidor principal
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm test` - Executa os testes (a implementar)

## 🚀 Deploy

1. Configure as variáveis de ambiente no servidor
2. Instale as dependências: `npm install --production`
3. Inicie o servidor: `npm start`

## 🤝 Integração com Flutter

Este backend foi projetado para funcionar com o app Flutter Compra Pronta. Para integrar:

1. Configure a URL base da API no Flutter
2. Use os endpoints de autenticação para login
3. Armazene o token JWT no dispositivo
4. Inclua o token no header `Authorization: Bearer <token>` nas requisições

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

Allan Dennis