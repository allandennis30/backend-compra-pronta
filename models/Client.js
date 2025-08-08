const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

/**
 * Modelo de cliente usando Supabase
 */
class Client {
  constructor() {
    this.tableName = 'clients';
  }

  /**
   * Busca cliente por email
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
          return null; // Cliente não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw error;
    }
  }

  /**
   * Busca cliente por ID
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
          return null; // Cliente não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente por ID:', error);
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
   * Cria um novo cliente
   * @param {Object} clientData 
   * @returns {Object}
   */
  async create(clientData) {
    try {
      // Hash da senha
      const hashedPassword = await this.hashPassword(clientData.senha);
      
      const newClient = {
        nome: clientData.nome,
        email: clientData.email,
        senha: hashedPassword,
        telefone: clientData.telefone,
        cpf: clientData.cpf || null,
        endereco: clientData.endereco || {},
        latitude: clientData.latitude || 0,
        longitude: clientData.longitude || 0,
        ativo: true,
        data_criacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([newClient])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeClient(data);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do cliente
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object}
   */
  async update(id, updateData) {
    try {
      const updateFields = {
        nome: updateData.nome,
        telefone: updateData.telefone,
        cpf: updateData.cpf,
        endereco: updateData.endereco,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        data_atualizacao: new Date().toISOString()
      };

      // Remove campos undefined
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeClient(data);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  /**
   * Busca todos os clientes ativos
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

      return data.map(client => this.sanitizeClient(client));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  /**
   * Remove dados sensíveis do cliente
   * @param {Object} client 
   * @returns {Object}
   */
  sanitizeClient(client) {
    const { senha, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
  }

  /**
   * Desativa cliente (soft delete)
   * @param {string} id 
   * @returns {boolean}
   */
  async deactivate(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ ativo: false, data_atualizacao: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      throw error;
    }
  }
}

module.exports = new Client();