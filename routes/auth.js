const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Validações para login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .trim()
];

/**
 * Validações para registro de cliente
 */
const registerClientValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .trim(),
  body('telefone')
    .optional()
    .trim(),
  body('cpf')
    .optional()
    .trim(),
  body('endereco')
    .optional()
    .custom((value) => {
      // Aceitar qualquer valor para address (objeto, string, ou null)
      return true;
    }),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número válido'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número válido')
];

/**
 * Validações para registro de vendedor
 */
const registerSellerValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .trim(),
  body('telefone')
    .optional()
    .trim(),
  body('cnpj')
    .notEmpty()
    .withMessage('CNPJ é obrigatório para vendedores')
    .trim(),
  body('nomeEmpresa')
    .notEmpty()
    .withMessage('Nome da empresa é obrigatório')
    .trim(),
  body('endereco')
    .optional()
    .isObject()
    .withMessage('Endereço deve ser um objeto válido'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número válido'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número válido')
];

/**
 * Gerar JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    nome: user.nome,
    isSeller: user.isSeller,
    tipo: user.isSeller ? 'vendedor' : 'cliente'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'compra-pronta-api',
    audience: 'compra-pronta-app'
  });
};

/**
 * Buscar usuário por email
 */
const findUserByEmail = async (email) => {
  const user = await User.findByEmail(email);
  if (user) {
    return { user, type: user.isSeller ? 'vendedor' : 'cliente' };
  }
  return null;
};

/**
 * Buscar usuário por ID
 */
const findUserById = async (id) => {
  return await User.findById(id);
};

/**
 * POST /api/auth/login
 * Autenticar usuário
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  console.log('🔐 [LOGIN] Tentativa de login:', req.body.email);
  
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [LOGIN] Erros de validação:', errors.array());
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;


    // Buscar usuário

    const userResult = await findUserByEmail(email);
    if (!userResult) {
      console.log('❌ [LOGIN] Usuário não encontrado:', email);
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    const { user, type } = userResult;


    // Verificar senha

    const isValidPassword = await user.verifyPassword(senha);
    if (!isValidPassword) {
      console.log('❌ [LOGIN] Senha incorreta para usuário:', email);
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }


    // Gerar token

    const token = generateToken(user);

    
    // Remover dados sensíveis
    const sanitizedUser = user.toJSON();


    console.log('✅ [LOGIN] Sucesso:', email, '(' + type + ')');
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: { ...sanitizedUser, tipo: type },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('💥 [LOGIN] ERRO CRÍTICO durante login:', error);
    console.error('💥 [LOGIN] Stack trace:', error.stack);
    console.error('💥 [LOGIN] Dados que causaram erro:', JSON.stringify(req.body, null, 2));
    
    // Re-throw para o errorHandler processar
    throw error;
  }
}));

/**
 * POST /api/auth/register/client
 * Registrar novo cliente
 */
router.post('/register/client', registerClientValidation, asyncHandler(async (req, res) => {
  console.log('🚀 [REGISTER/CLIENT] Iniciando cadastro de cliente');
  console.log('📝 [REGISTER/CLIENT] Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [REGISTER/CLIENT] Erros de validação:', errors.array());
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Verifique os dados fornecidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, telefone, cpf, endereco, latitude, longitude } = req.body;
    console.log('✅ [REGISTER/CLIENT] Validação passou, dados extraídos:', { nome, email, telefone, cpf, latitude, longitude });

    // Verificar se o email já existe
    console.log('🔍 [REGISTER/CLIENT] Verificando se email já existe:', email);
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('❌ [REGISTER/CLIENT] Email já cadastrado:', email);
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Este email já está em uso'
      });
    }
    console.log('✅ [REGISTER/CLIENT] Email disponível:', email);

    // Criar novo cliente
    const clientData = {
      nome,
      email,
      senha,
      telefone: telefone || '',
      cpf: cpf || null,
      endereco: endereco || {},
      latitude: latitude || 0,
      longitude: longitude || 0,
      isSeller: false
    };
    console.log('📋 [REGISTER/CLIENT] Dados do cliente preparados:', JSON.stringify(clientData, null, 2));

    console.log('🔄 [REGISTER/CLIENT] Chamando User.create()...');
    const newClient = await User.create(clientData);
    console.log('✅ [REGISTER/CLIENT] Cliente criado com sucesso:', newClient.id);
    
    // Gerar token
    console.log('🔑 [REGISTER/CLIENT] Gerando token JWT...');
    const token = generateToken(newClient);
    console.log('✅ [REGISTER/CLIENT] Token gerado com sucesso');
    
    // Remover dados sensíveis
    const sanitizedClient = newClient.toJSON();
    console.log('🧹 [REGISTER/CLIENT] Dados sanitizados, removendo senha');

    console.log('🎉 [REGISTER/CLIENT] Cadastro finalizado com sucesso para:', email);
    res.status(201).json({
      message: 'Cliente criado com sucesso',
      token,
      user: { ...sanitizedClient, tipo: 'cliente' },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('💥 [REGISTER/CLIENT] ERRO CRÍTICO durante cadastro:', error);
    console.error('💥 [REGISTER/CLIENT] Stack trace:', error.stack);
    console.error('💥 [REGISTER/CLIENT] Dados que causaram erro:', JSON.stringify(req.body, null, 2));
    
    // Re-throw para o errorHandler processar
    throw error;
  }
}));

/**
 * POST /api/auth/register/seller
 * Registrar novo vendedor
 */
router.post('/register/seller', registerSellerValidation, asyncHandler(async (req, res) => {
  // Verificar erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados fornecidos',
      details: errors.array()
    });
  }

  const { nome, email, senha, telefone, cnpj, nomeEmpresa, endereco, latitude, longitude } = req.body;

  // Verificar se o email já existe
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email já cadastrado',
      message: 'Este email já está em uso'
    });
  }

  // Verificar se o CNPJ já existe
  const existingSellers = await User.findSellers();
  const existingSeller = existingSellers.find(seller => seller.cnpj === cnpj);
  if (existingSeller) {
    return res.status(409).json({
      error: 'CNPJ já cadastrado',
      message: 'Este CNPJ já está em uso'
    });
  }

  // Criar novo vendedor
  const sellerData = {
    nome,
    email,
    senha,
    telefone: telefone || '',
    cnpj,
    nome_empresa: nomeEmpresa,
    endereco: endereco || {},
    latitude: latitude || 0,
    longitude: longitude || 0,
    isSeller: true
  };

  const newSeller = await User.create(sellerData);
  
  // Gerar token
  const token = generateToken(newSeller);
  
  // Remover dados sensíveis
  const sanitizedSeller = newSeller.toJSON();

  res.status(201).json({
    message: 'Vendedor criado com sucesso',
    token,
    user: { ...sanitizedSeller, tipo: 'vendedor' },
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * POST /api/auth/verify
 * Verificar se o token é válido
 */
router.post('/verify', verifyToken, asyncHandler(async (req, res) => {
  // Se chegou até aqui, o token é válido
  const user = await findUserById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = user.toJSON();
  const userType = user.isSeller ? 'vendedor' : 'cliente';

  res.status(200).json({
    message: 'Token válido',
    user: { ...sanitizedUser, tipo: userType },
    tokenInfo: {
      id: req.user.id,
      email: req.user.email,
      isSeller: req.user.isSeller,
      tipo: userType,
      iat: new Date(req.user.iat * 1000).toISOString(),
      exp: new Date(req.user.exp * 1000).toISOString()
    }
  });
}));

/**
 * POST /api/auth/refresh
 * Renovar token
 */
router.post('/refresh', verifyToken, asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  // Gerar novo token
  const newToken = generateToken(user);
  const sanitizedUser = user.toJSON();
  const userType = user.isSeller ? 'vendedor' : 'cliente';

  res.status(200).json({
    message: 'Token renovado com sucesso',
    token: newToken,
    user: { ...sanitizedUser, tipo: userType },
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * GET /api/auth/profile
 * Obter perfil do usuário autenticado
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = user.toJSON();
  const userType = user.isSeller ? 'vendedor' : 'cliente';

  res.status(200).json({
    message: 'Perfil obtido com sucesso',
    user: { ...sanitizedUser, tipo: userType }
  });
}));

/**
 * GET /api/auth/clients
 * Listar todos os clientes (rota protegida para teste)
 */
router.get('/clients', verifyToken, asyncHandler(async (req, res) => {
  const clients = await User.findClients();
  
  res.status(200).json({
    message: 'Clientes obtidos com sucesso',
    clients: clients.map(client => ({ ...client.toJSON(), tipo: 'cliente' })),
    total: clients.length
  });
}));

/**
 * GET /api/auth/sellers
 * Listar todos os vendedores (rota protegida para teste)
 */
router.get('/sellers', verifyToken, asyncHandler(async (req, res) => {
  const sellers = await User.findSellers();
  
  res.status(200).json({
    message: 'Vendedores obtidos com sucesso',
    sellers: sellers.map(seller => ({ ...seller.toJSON(), tipo: 'vendedor' })),
    total: sellers.length
  });
}));

/**
 * GET /api/auth/users
 * Listar todos os usuários (clientes e vendedores)
 */
router.get('/users', verifyToken, asyncHandler(async (req, res) => {
  const allUsers = await User.findAll();
  const clients = allUsers.filter(user => !user.isSeller);
  const sellers = allUsers.filter(user => user.isSeller);
  
  const formattedUsers = allUsers.map(user => ({
    ...user.toJSON(),
    tipo: user.isSeller ? 'vendedor' : 'cliente'
  }));
  
  res.status(200).json({
    message: 'Usuários obtidos com sucesso',
    users: formattedUsers,
    total: allUsers.length,
    breakdown: {
      clients: clients.length,
      sellers: sellers.length
    }
  });
}));

/**
 * POST /api/auth/logout
 * Logout (invalidar token no cliente)
 */
router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  // Em uma implementação real, você poderia adicionar o token a uma blacklist
  // Por enquanto, apenas retornamos sucesso
  res.status(200).json({
    message: 'Logout realizado com sucesso',
    instruction: 'Remova o token do armazenamento local'
  });
}));

module.exports = router;