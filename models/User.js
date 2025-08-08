const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

/**
 * Modelo de usuário usando Supabase
 */
class User {
  constructor() {
    this.tableName = 'users';
  }

  /**
   * Busca usuário por email
   * @param {string} email 
   * @returns {Object|null}
   */
  async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   * @param {string} id 
   * @returns {Object|null}
   */
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Verifica se a senha está correta
   * @param {string} plainPassword 
   * @param {string} hashedPassword 
   * @returns {boolean}
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Gera hash da senha
   * @param {string} password 
   * @returns {string}
   */
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData 
   * @returns {Object}
   */
  async create(userData) {
    try {
      // Hash da senha
      const hashedPassword = await this.hashPassword(userData.senha);
      
      const newUser = {
        nome: userData.nome,
        email: userData.email,
        senha: hashedPassword,
        tipo: userData.tipo || 'cliente',
        telefone: userData.telefone,
        cpf: userData.cpf || null,
        cnpj: userData.cnpj || null,
        nome_empresa: userData.nomeEmpresa || null,
        endereco: userData.endereco || {},
        latitude: userData.latitude || 0,
        longitude: userData.longitude || 0,
        ativo: true,
        data_criacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([newUser])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeUser(data);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca todos os usuários
   * @returns {Array}
   */
  async findAll() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('ativo', true);

      if (error) {
        throw error;
      }

      return data.map(user => this.sanitizeUser(user));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Remove dados sensíveis do usuário
   * @param {Object} user 
   * @returns {Object}
   */
  sanitizeUser(user) {
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new User();