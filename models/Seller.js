const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

/**
 * Modelo de vendedor usando Supabase
 */
class Seller {
  constructor() {
    this.tableName = 'sellers';
  }

  /**
   * Busca vendedor por email
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
          return null; // Vendedor não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar vendedor por email:', error);
      throw error;
    }
  }

  /**
   * Busca vendedor por ID
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
          return null; // Vendedor não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar vendedor por ID:', error);
      throw error;
    }
  }

  /**
   * Busca vendedor por CNPJ
   * @param {string} cnpj 
   * @returns {Object|null}
   */
  async findByCnpj(cnpj) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cnpj', cnpj)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Vendedor não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar vendedor por CNPJ:', error);
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
   * Cria um novo vendedor
   * @param {Object} sellerData 
   * @returns {Object}
   */
  async create(sellerData) {
    try {
      // Hash da senha
      const hashedPassword = await this.hashPassword(sellerData.senha);
      
      const newSeller = {
        nome: sellerData.nome,
        email: sellerData.email,
        senha: hashedPassword,
        telefone: sellerData.telefone,
        cnpj: sellerData.cnpj,
        nome_empresa: sellerData.nomeEmpresa,
        endereco: sellerData.endereco || {},
        latitude: sellerData.latitude || 0,
        longitude: sellerData.longitude || 0,
        ativo: true,
        data_criacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([newSeller])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.sanitizeSeller(data);
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do vendedor
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object}
   */
  async update(id, updateData) {
    try {
      const updateFields = {
        nome: updateData.nome,
        telefone: updateData.telefone,
        cnpj: updateData.cnpj,
        nome_empresa: updateData.nomeEmpresa,
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

      return this.sanitizeSeller(data);
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      throw error;
    }
  }

  /**
   * Busca todos os vendedores ativos
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

      return data.map(seller => this.sanitizeSeller(seller));
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      throw error;
    }
  }

  /**
   * Busca vendedores por proximidade geográfica
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} radius - raio em km
   * @returns {Array}
   */
  async findByLocation(latitude, longitude, radius = 10) {
    try {
      // Usando a fórmula de Haversine para calcular distância
      const { data, error } = await supabase
        .rpc('sellers_within_radius', {
          lat: latitude,
          lng: longitude,
          radius_km: radius
        });

      if (error) {
        // Se a função RPC não existir, fazer busca simples
        console.warn('Função RPC não encontrada, fazendo busca simples');
        return await this.findAll();
      }

      return data.map(seller => this.sanitizeSeller(seller));
    } catch (error) {
      console.error('Erro ao buscar vendedores por localização:', error);
      // Fallback para busca simples
      return await this.findAll();
    }
  }

  /**
   * Remove dados sensíveis do vendedor
   * @param {Object} seller 
   * @returns {Object}
   */
  sanitizeSeller(seller) {
    const { senha, ...sellerWithoutPassword } = seller;
    return sellerWithoutPassword;
  }

  /**
   * Desativa vendedor (soft delete)
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
      console.error('Erro ao desativar vendedor:', error);
      throw error;
    }
  }
}

module.exports = new Seller();