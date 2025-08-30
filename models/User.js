const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

class User {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.telefone = data.telefone;
    this.cpf = data.cpf;
    this.cnpj = data.cnpj;
    this.nome_empresa = data.nome_empresa;
    this.endereco = data.endereco;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.isSeller = data.isSeller || false;
    this.ativo = data.ativo;
    this.data_criacao = data.data_criacao;
    this.data_atualizacao = data.data_atualizacao;
  }

  /**
   * Buscar usuário por email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return new User(data);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return new User(data);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário com filtros (equivalente ao findOne do Mongoose)
   */
  static async findOne(filters) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('ativo', true);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return new User(data);
    } catch (error) {
      console.error('Erro ao buscar usuário com filtros:', error);
      throw error;
    }
  }

  /**
   * Buscar usuários com filtros (equivalente ao find do Mongoose)
   */
  static async find(filters = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('ativo', true);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(user => new User(user));
    } catch (error) {
      console.error('Erro ao buscar usuários com filtros:', error);
      throw error;
    }
  }

  /**
   * Criar novo usuário
   */
  static async create(userData) {
    try {
      console.log('🔄 [USER.CREATE] Iniciando criação de usuário');
      console.log('📝 [USER.CREATE] Dados recebidos:', JSON.stringify(userData, null, 2));
      
      // Hash da senha
      console.log('🔐 [USER.CREATE] Fazendo hash da senha...');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.senha, saltRounds);
      console.log('✅ [USER.CREATE] Senha hashada com sucesso');

      const newUser = {
        nome: userData.nome,
        email: userData.email,
        senha: hashedPassword,
        telefone: userData.telefone || null,
        cpf: userData.cpf || null,
        cnpj: userData.cnpj || null,
        nome_empresa: userData.nome_empresa || null,
        endereco: userData.endereco || {},
        latitude: userData.latitude || 0,
        longitude: userData.longitude || 0,
        isSeller: userData.isSeller || false,
        ativo: true
      };
      
      console.log('📋 [USER.CREATE] Dados preparados para inserção:', JSON.stringify(newUser, null, 2));
      console.log('🔄 [USER.CREATE] Chamando Supabase insert...');

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) {
        console.error('❌ [USER.CREATE] Erro do Supabase:', error);
        console.error('❌ [USER.CREATE] Código do erro:', error.code);
        console.error('❌ [USER.CREATE] Mensagem do erro:', error.message);
        console.error('❌ [USER.CREATE] Detalhes do erro:', error.details);
        throw error;
      }

      console.log('✅ [USER.CREATE] Usuário criado no Supabase:', data.id);
      console.log('🔄 [USER.CREATE] Criando instância User...');
      
      const user = new User(data);
      console.log('✅ [USER.CREATE] Instância User criada com sucesso');
      
      return user;
    } catch (error) {
      console.error('💥 [USER.CREATE] ERRO CRÍTICO durante criação:', error);
      console.error('💥 [USER.CREATE] Stack trace:', error.stack);
      console.error('💥 [USER.CREATE] Tipo do erro:', error.constructor.name);
      console.error('💥 [USER.CREATE] Dados que causaram erro:', JSON.stringify(userData, null, 2));
      
      throw error;
    }
  }

  /**
   * Atualizar usuário
   */
  async update(updateData) {
    try {
      // Se a senha está sendo atualizada, fazer hash
      if (updateData.senha) {
        const saltRounds = 12;
        updateData.senha = await bcrypt.hash(updateData.senha, saltRounds);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar propriedades do objeto atual
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Deletar usuário (soft delete)
   */
  async delete() {
    try {
      const { error } = await supabase
        .from('users')
        .update({ ativo: false })
        .eq('id', this.id);

      if (error) {
        throw error;
      }

      this.ativo = false;
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  /**
   * Verificar senha
   */
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.senha);
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  /**
   * Buscar todos os usuários (com filtros opcionais)
   */
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('ativo', true);

      // Aplicar filtros
      if (filters.isSeller !== undefined) {
        query = query.eq('isSeller', filters.isSeller);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(user => new User(user));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Buscar apenas clientes
   */
  static async findClients(filters = {}) {
    return await User.findAll({ ...filters, isSeller: false });
  }

  /**
   * Buscar apenas vendedores
   */
  static async findSellers(filters = {}) {
    return await User.findAll({ ...filters, isSeller: true });
  }

  /**
   * Converter para JSON (removendo senha)
   */
  toJSON() {
    const { senha, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  /**
   * Verificar se é vendedor
   */
  isSellerUser() {
    return this.isSeller === true;
  }

  /**
   * Verificar se é cliente
   */
  isClientUser() {
    return this.isSeller === false;
  }
}

module.exports = User;