const bcrypt = require('bcryptjs');

/**
 * Modelo de usuário com dados mockados
 * Em produção, isso seria substituído por um banco de dados
 */
class User {
  constructor() {
    // Dados mockados de usuários (senhas já hasheadas)
    this.users = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@vendedor.com',
        senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', // senha123
        tipo: 'vendedor',
        telefone: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        nomeEmpresa: 'Supermercado Silva',
        endereco: {
          rua: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          cep: '01234-567',
          estado: 'SP'
        },
        ativo: true,
        dataCriacao: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@cliente.com',
        senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', // senha123
        tipo: 'cliente',
        telefone: '(11) 88888-8888',
        cpf: '123.456.789-00',
        endereco: {
          rua: 'Av. Paulista, 1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          cep: '01310-100',
          estado: 'SP'
        },
        ativo: true,
        dataCriacao: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        nome: 'Carlos Oliveira',
        email: 'carlos@vendedor.com',
        senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', // senha123
        tipo: 'vendedor',
        telefone: '(11) 77777-7777',
        cnpj: '98.765.432/0001-10',
        nomeEmpresa: 'Mercado Oliveira',
        endereco: {
          rua: 'Rua Augusta, 456',
          bairro: 'Consolação',
          cidade: 'São Paulo',
          cep: '01305-000',
          estado: 'SP'
        },
        ativo: true,
        dataCriacao: '2024-01-10T09:15:00Z'
      },
      {
        id: '4',
        nome: 'Ana Costa',
        email: 'ana@cliente.com',
        senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfm', // senha123
        tipo: 'cliente',
        telefone: '(11) 66666-6666',
        cpf: '987.654.321-00',
        endereco: {
          rua: 'Rua Oscar Freire, 789',
          bairro: 'Jardins',
          cidade: 'São Paulo',
          cep: '01426-001',
          estado: 'SP'
        },
        ativo: true,
        dataCriacao: '2024-01-25T16:45:00Z'
      }
    ];
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email) {
    return this.users.find(user => user.email === email && user.ativo);
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    return this.users.find(user => user.id === id && user.ativo);
  }

  /**
   * Verificar senha
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Hash da senha (para novos usuários)
   */
  async hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, rounds);
  }

  /**
   * Criar novo usuário (para futuras implementações)
   */
  async create(userData) {
    const newUser = {
      id: (this.users.length + 1).toString(),
      ...userData,
      senha: await this.hashPassword(userData.senha),
      ativo: true,
      dataCriacao: new Date().toISOString()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Listar todos os usuários (sem senhas)
   */
  async findAll() {
    return this.users
      .filter(user => user.ativo)
      .map(user => {
        const { senha, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
  }

  /**
   * Remover dados sensíveis do usuário
   */
  sanitizeUser(user) {
    if (!user) return null;
    
    const { senha, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = new User();