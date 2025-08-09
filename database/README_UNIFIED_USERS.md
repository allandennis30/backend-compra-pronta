# Migração para Tabela Unificada de Usuários

## Visão Geral

Este projeto foi atualizado para usar uma tabela unificada `users` que combina clientes e vendedores em uma única estrutura, utilizando o campo booleano `isSeller` para diferenciar os tipos de usuário.

## Principais Mudanças

### 1. Nova Estrutura da Tabela `users`

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),           -- Para clientes
  cnpj VARCHAR(18),          -- Para vendedores
  nome_empresa VARCHAR(255), -- Para vendedores
  endereco JSONB DEFAULT '{}',
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  isSeller BOOLEAN DEFAULT false, -- Campo chave: true = vendedor, false = cliente
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Campo `isSeller`

- **`false`**: Usuário é um cliente
- **`true`**: Usuário é um vendedor com funcionalidades de venda habilitadas

### 3. Novo Modelo `User.js`

O modelo unificado `User` substitui os modelos `Client` e `Seller` separados:

```javascript
// Buscar usuário por email (funciona para clientes e vendedores)
const user = await User.findByEmail('email@exemplo.com');

// Verificar tipo de usuário
if (user.isSeller) {
  // Usuário é vendedor
} else {
  // Usuário é cliente
}

// Buscar apenas clientes
const clients = await User.findClients();

// Buscar apenas vendedores
const sellers = await User.findSellers();
```

### 4. Autenticação Atualizada

#### Token JWT
O token agora inclui o campo `isSeller`:
```javascript
{
  id: "user-id",
  email: "user@email.com",
  nome: "Nome do Usuário",
  isSeller: true, // ou false
  tipo: "vendedor" // ou "cliente"
}
```

#### Middleware de Autorização
```javascript
// Verificar se é vendedor
const requireVendedor = (req, res, next) => {
  if (!req.user.isSeller) {
    return res.status(403).json({ error: 'Apenas vendedores' });
  }
  next();
};

// Verificar se é cliente
const requireCliente = (req, res, next) => {
  if (req.user.isSeller) {
    return res.status(403).json({ error: 'Apenas clientes' });
  }
  next();
};
```

## Como Migrar

### Passo 1: Criar Nova Tabela
Execute no SQL Editor do Supabase:
```bash
create_unified_users_table.sql
```

### Passo 2: Migrar Dados (Opcional)
Se você tem dados nas tabelas antigas `clients` e `sellers`:
```bash
migrate_to_unified_users.sql
```

### Passo 3: Atualizar Backend
O backend já foi atualizado para usar o novo modelo `User`.

### Passo 4: Testar
```bash
# Login funciona igual para clientes e vendedores
POST /api/auth/login
{
  "email": "usuario@email.com",
  "senha": "senha123"
}

# Registro de cliente
POST /api/auth/register/client
{
  "nome": "Nome Cliente",
  "email": "cliente@email.com",
  "senha": "senha123",
  "cpf": "123.456.789-01"
}

# Registro de vendedor
POST /api/auth/register/seller
{
  "nome": "Nome Vendedor",
  "email": "vendedor@email.com",
  "senha": "senha123",
  "cnpj": "12.345.678/0001-90",
  "nomeEmpresa": "Minha Empresa"
}
```

## Vantagens da Nova Estrutura

1. **Simplicidade**: Uma única tabela para gerenciar
2. **Flexibilidade**: Usuários podem alternar entre cliente/vendedor
3. **Manutenção**: Código mais limpo e fácil de manter
4. **Performance**: Menos JOINs e consultas mais eficientes
5. **Escalabilidade**: Fácil adicionar novos tipos de usuário

## Funcionalidades no App

### Para Clientes (`isSeller: false`)
- Visualizar produtos
- Fazer pedidos
- Gerenciar perfil
- Histórico de compras

### Para Vendedores (`isSeller: true`)
- Todas as funcionalidades de cliente +
- Cadastrar produtos
- Gerenciar estoque
- Processar pedidos
- Dashboard de vendas
- Relatórios

## Usuários de Teste

Após executar o script de criação, você terá:

### Clientes
- **maria@cliente.com** / senha123
- **ana@cliente.com** / senha123

### Vendedores
- **joao@vendedor.com** / senha123
- **carlos@vendedor.com** / senha123

## Notas Importantes

1. O login funciona igual para todos os usuários
2. O sistema detecta automaticamente se é cliente ou vendedor
3. As funcionalidades são liberadas baseadas no campo `isSeller`
4. Não é necessário especificar o tipo no login
5. O token JWT contém todas as informações necessárias

## Próximos Passos

1. Atualizar o frontend Flutter para usar a nova estrutura
2. Implementar controle de funcionalidades baseado em `isSeller`
3. Criar interface para alternar entre modo cliente/vendedor
4. Implementar dashboard específico para vendedores