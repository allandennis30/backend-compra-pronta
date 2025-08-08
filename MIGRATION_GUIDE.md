# Guia de Migração: Separação de Usuários em Clientes e Vendedores

## Resumo das Mudanças

Este projeto foi refatorado para separar a tabela única `users` em duas tabelas distintas:
- `clients` - Para clientes
- `sellers` - Para vendedores

## Estrutura Anterior vs Nova

### Antes
```sql
users (
  id, nome, email, senha, tipo, telefone, cpf, cnpj, 
  nome_empresa, endereco, latitude, longitude, ativo, 
  data_criacao, data_atualizacao
)
```

### Depois
```sql
clients (
  id, nome, email, senha, telefone, cpf, endereco, 
  latitude, longitude, ativo, data_criacao, data_atualizacao
)

sellers (
  id, nome, email, senha, telefone, cnpj, nome_empresa, 
  endereco, latitude, longitude, ativo, data_criacao, data_atualizacao
)
```

## Arquivos Modificados

### Backend
1. **`database/create_tables.sql`** - Criação das novas tabelas
2. **`database/insert_test_users.sql`** - Dados de teste atualizados
3. **`database/migration_to_separate_tables.sql`** - Script de migração
4. **`models/Client.js`** - Novo modelo para clientes
5. **`models/Seller.js`** - Novo modelo para vendedores
6. **`routes/auth.js`** - Rotas atualizadas

### Novos Modelos

#### Client.js
- `findByEmail(email)`
- `findById(id)`
- `create(clientData)`
- `update(id, updateData)`
- `findAll()`
- `sanitizeClient(client)`
- `deactivate(id)`
- `verifyPassword(plainPassword, hashedPassword)`
- `hashPassword(password)`

#### Seller.js
- `findByEmail(email)`
- `findById(id)`
- `findByCnpj(cnpj)`
- `create(sellerData)`
- `update(id, updateData)`
- `findAll()`
- `findByLocation(latitude, longitude, radius)`
- `sanitizeSeller(seller)`
- `deactivate(id)`
- `verifyPassword(plainPassword, hashedPassword)`
- `hashPassword(password)`

## Novas Rotas da API

### Autenticação
- `POST /api/auth/login` - Login unificado (busca em ambas as tabelas)
- `POST /api/auth/register/client` - Registro de cliente
- `POST /api/auth/register/seller` - Registro de vendedor
- `GET /api/auth/clients` - Listar clientes
- `GET /api/auth/sellers` - Listar vendedores
- `GET /api/auth/users` - Listar todos (clientes + vendedores)

### Rotas Mantidas
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/profile` - Perfil do usuário
- `POST /api/auth/logout` - Logout

## Processo de Migração

### 1. Backup dos Dados
```sql
-- Fazer backup da tabela users
CREATE TABLE users_backup AS SELECT * FROM users;
```

### 2. Executar Scripts
1. Execute `create_tables.sql` para criar as novas tabelas
2. Execute `migration_to_separate_tables.sql` para migrar os dados
3. Verifique se os dados foram migrados corretamente

### 3. Verificação
```sql
-- Verificar contagem de registros
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM sellers;
SELECT COUNT(*) FROM users WHERE tipo = 'cliente';
SELECT COUNT(*) FROM users WHERE tipo = 'vendedor';
```

### 4. Atualizar Aplicação
1. Atualize o código do backend
2. Teste as novas rotas
3. Verifique se o login funciona corretamente

### 5. Limpeza (Opcional)
```sql
-- APENAS após confirmar que tudo funciona
DROP TABLE users CASCADE;
```

## Dados de Teste

### Clientes
- `maria@cliente.com` - senha: senha123
- `ana@cliente.com` - senha: senha123

### Vendedores
- `joao@vendedor.com` - senha: senha123 (Supermercado Silva)
- `carlos@vendedor.com` - senha: senha123 (Mercado Oliveira)

## Validações

### Cliente
- Nome: obrigatório (2-100 caracteres)
- Email: obrigatório e único
- Senha: obrigatório (mínimo 6 caracteres)
- Telefone: opcional
- CPF: opcional
- Endereço: opcional (objeto JSON)
- Latitude/Longitude: opcional

### Vendedor
- Nome: obrigatório (2-100 caracteres)
- Email: obrigatório e único
- Senha: obrigatório (mínimo 6 caracteres)
- Telefone: opcional
- CNPJ: obrigatório e único
- Nome da Empresa: obrigatório
- Endereço: opcional (objeto JSON)
- Latitude/Longitude: opcional

## Funcionalidades Adicionais

### Busca por Proximidade
O modelo `Seller` inclui uma função `findByLocation()` que permite buscar vendedores por proximidade geográfica usando a fórmula de Haversine.

### Função SQL de Proximidade
```sql
SELECT * FROM sellers_within_radius(-23.5505, -46.6333, 10);
-- Busca vendedores num raio de 10km de São Paulo
```

## Considerações de Segurança

1. **Senhas**: Continuam sendo hasheadas com bcrypt
2. **Tokens JWT**: Incluem o tipo de usuário (cliente/vendedor)
3. **Validação**: Emails únicos em ambas as tabelas
4. **CNPJ**: Validação de unicidade para vendedores

## Troubleshooting

### Erro: "Email já cadastrado"
- Verifique se o email existe em ambas as tabelas (clients e sellers)

### Erro: "CNPJ já cadastrado"
- Verifique se o CNPJ já existe na tabela sellers

### Erro: "Usuário não encontrado" no login
- Verifique se o usuário foi migrado corretamente
- Confirme se as tabelas clients e sellers existem

### Token inválido após migração
- Tokens antigos podem não funcionar devido à mudança na estrutura
- Usuários precisarão fazer login novamente

## Próximos Passos

1. Atualizar o frontend para usar as novas rotas
2. Implementar validação de CPF/CNPJ
3. Adicionar funcionalidades específicas para vendedores
4. Implementar sistema de produtos por vendedor
5. Criar dashboard específico para cada tipo de usuário