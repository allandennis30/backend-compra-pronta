# Configuração da API de Produtos

Este documento explica como configurar a API de produtos no backend.

## 📋 Pré-requisitos

1. Backend já configurado e funcionando
2. Banco de dados Supabase configurado
3. Tabelas de usuários (clients/sellers) já criadas

## 🗄️ Configuração do Banco de Dados

### 1. Criar Tabela de Produtos

Execute o script SQL no painel do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `feljoannoghnpbqhrsuv`
3. Vá em **SQL Editor**
4. Execute o script: `backend/database/execute_products_table.sql`

### 2. Verificar Criação

Após executar o script, verifique se:

- ✅ Tabela `products` foi criada
- ✅ Índices foram criados
- ✅ Políticas RLS foram configuradas
- ✅ Trigger de `updated_at` foi criado

## 🔧 Configuração do Backend

### 1. Rotas de Produtos

As rotas já estão configuradas em `backend/routes/products.js`:

- `POST /api/products` - Criar produto
- `GET /api/products` - Listar produtos do vendedor
- `GET /api/products/:id` - Obter produto específico
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `GET /api/products/barcode/:barcode` - Verificar código de barras

### 2. Validações

O sistema inclui validações para:

- ✅ Nome do produto (2-100 caracteres)
- ✅ Descrição (10-500 caracteres)
- ✅ Preço (número positivo)
- ✅ Categoria (obrigatória)
- ✅ Código de barras (obrigatório)
- ✅ Estoque (inteiro positivo)
- ✅ Tipo de venda (por peso ou unidade)
- ✅ Preço por kg (quando vendido por peso)

### 3. Segurança

- ✅ Apenas vendedores podem criar/editar produtos
- ✅ Vendedores só veem seus próprios produtos
- ✅ Verificação de código de barras duplicado
- ✅ Autenticação JWT obrigatória

## 🚀 Testando a API

### 1. Criar Produto

```bash
curl -X POST https://backend-compra-pronta.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "Maçã Fuji",
    "description": "Maçãs frescas e doces",
    "price": 8.90,
    "category": "Frutas e Verduras",
    "barcode": "7891234567890",
    "stock": 50,
    "isSoldByWeight": false,
    "isAvailable": true
  }'
```

### 2. Listar Produtos

```bash
curl -X GET https://backend-compra-pronta.onrender.com/api/products \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### 3. Verificar Código de Barras

```bash
curl -X GET https://backend-compra-pronta.onrender.com/api/products/barcode/7891234567890 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## 📱 Configuração do App Flutter

### 1. Repository Factory

O app está configurado para usar a API real:

```dart
// lib/core/repositories/repository_factory.dart
static const bool _useMockData = false; // Usar API real
```

### 2. Endpoints

Os endpoints estão configurados em:

```dart
// lib/constants/app_constants.dart
static const String productsEndpoint = '$baseUrl$apiVersion/products';
static const String createProductEndpoint = '$baseUrl$apiVersion/products';
// ... outros endpoints
```

### 3. Autenticação

O app envia automaticamente o token JWT nas requisições:

```dart
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer $token',
}
```

## 🔍 Monitoramento

### Logs do Backend

O backend registra todas as operações:

- ✅ Criação de produtos
- ✅ Atualização de produtos
- ✅ Listagem de produtos
- ✅ Verificação de código de barras
- ✅ Erros de validação
- ✅ Erros de autenticação

### Exemplo de Log

```
🛍️ [PRODUCTS/CREATE] Iniciando criação de produto
📝 [PRODUCTS/CREATE] Dados recebidos: {...}
🔍 [PRODUCTS/CREATE] Verificando código de barras: 7891234567890
📦 [PRODUCTS/CREATE] Criando produto no banco...
✅ [PRODUCTS/CREATE] Produto criado com sucesso: uuid-123
```

## 🐛 Solução de Problemas

### Erro 401 - Não Autorizado
- Verifique se o token JWT é válido
- Verifique se o usuário é vendedor

### Erro 409 - Código de Barras Duplicado
- O código de barras já existe para este vendedor
- Use um código único

### Erro 400 - Dados Inválidos
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique se os tipos de dados estão corretos

### Erro 500 - Erro do Servidor
- Verifique os logs do backend
- Verifique se a tabela de produtos existe
- Verifique se as políticas RLS estão configuradas

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do backend
2. Verifique se a tabela foi criada corretamente
3. Teste as rotas com curl ou Postman
4. Verifique se o token JWT é válido

## ✅ Checklist de Configuração

- [ ] Tabela `products` criada no Supabase
- [ ] Índices criados
- [ ] Políticas RLS configuradas
- [ ] Trigger de `updated_at` criado
- [ ] Backend reiniciado
- [ ] Rotas de produtos funcionando
- [ ] App configurado para usar API real
- [ ] Testes realizados com sucesso
