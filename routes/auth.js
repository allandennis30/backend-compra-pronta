const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const Seller = require('../models/Seller');
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
const generateToken = (user, userType) => {
  const payload = {
    id: user.id,
    email: user.email,
    tipo: userType // 'cliente' ou 'vendedor'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'compra-pronta-api',
    audience: 'compra-pronta-app'
  });
};

/**
 * Buscar usuário por email em ambas as tabelas
 */
const findUserByEmail = async (email) => {
  // Primeiro tenta encontrar como cliente
  let user = await Client.findByEmail(email);
  if (user) {
    return { user, type: 'cliente' };
  }
  
  // Se não encontrou como cliente, tenta como vendedor
  user = await Seller.findByEmail(email);
  if (user) {
    return { user, type: 'vendedor' };
  }
  
  return null;
};

/**
 * Buscar usuário por ID em ambas as tabelas
 */
const findUserById = async (id, type) => {
  if (type === 'cliente') {
    return await Client.findById(id);
  } else if (type === 'vendedor') {
    return await Seller.findById(id);
  }
  return null;
};

/**
 * POST /api/auth/login
 * Autenticar usuário
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Verificar erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { email, senha } = req.body;

  // Buscar usuário em ambas as tabelas
  const userResult = await findUserByEmail(email);
  if (!userResult) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  const { user, type } = userResult;
  const Model = type === 'cliente' ? Client : Seller;

  // Verificar senha
  const isValidPassword = await Model.verifyPassword(senha, user.senha);
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  // Gerar token
  const token = generateToken(user, type);
  
  // Remover dados sensíveis
  const sanitizedUser = type === 'cliente' ? Client.sanitizeClient(user) : Seller.sanitizeSeller(user);

  res.status(200).json({
    message: 'Login realizado com sucesso',
    token,
    user: { ...sanitizedUser, tipo: type },
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * POST /api/auth/register/client
 * Registrar novo cliente
 */
router.post('/register/client', registerClientValidation, asyncHandler(async (req, res) => {
  // Verificar erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados fornecidos',
      details: errors.array()
    });
  }

  const { nome, email, senha, telefone, cpf, endereco, latitude, longitude } = req.body;

  // Verificar se o email já existe em ambas as tabelas
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email já cadastrado',
      message: 'Este email já está em uso'
    });
  }

  // Criar novo cliente
  const clientData = {
    nome,
    email,
    senha,
    telefone: telefone || '',
    cpf: cpf || null,
    endereco: endereco || {},
    latitude: latitude || 0,
    longitude: longitude || 0
  };

  const newClient = await Client.create(clientData);
  
  // Gerar token
  const token = generateToken(newClient, 'cliente');
  
  // Remover dados sensíveis
  const sanitizedClient = Client.sanitizeClient(newClient);

  res.status(201).json({
    message: 'Cliente criado com sucesso',
    token,
    user: { ...sanitizedClient, tipo: 'cliente' },
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
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

  // Verificar se o email já existe em ambas as tabelas
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email já cadastrado',
      message: 'Este email já está em uso'
    });
  }

  // Verificar se o CNPJ já existe
  const existingSeller = await Seller.findByCnpj(cnpj);
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
    nomeEmpresa,
    endereco: endereco || {},
    latitude: latitude || 0,
    longitude: longitude || 0
  };

  const newSeller = await Seller.create(sellerData);
  
  // Gerar token
  const token = generateToken(newSeller, 'vendedor');
  
  // Remover dados sensíveis
  const sanitizedSeller = Seller.sanitizeSeller(newSeller);

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
  const user = await findUserById(req.user.id, req.user.tipo);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = req.user.tipo === 'cliente' ? 
    Client.sanitizeClient(user) : 
    Seller.sanitizeSeller(user);

  res.status(200).json({
    message: 'Token válido',
    user: { ...sanitizedUser, tipo: req.user.tipo },
    tokenInfo: {
      id: req.user.id,
      email: req.user.email,
      tipo: req.user.tipo,
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
  const user = await findUserById(req.user.id, req.user.tipo);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  // Gerar novo token
  const newToken = generateToken(user, req.user.tipo);
  const sanitizedUser = req.user.tipo === 'cliente' ? 
    Client.sanitizeClient(user) : 
    Seller.sanitizeSeller(user);

  res.status(200).json({
    message: 'Token renovado com sucesso',
    token: newToken,
    user: { ...sanitizedUser, tipo: req.user.tipo },
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * GET /api/auth/profile
 * Obter perfil do usuário autenticado
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id, req.user.tipo);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = req.user.tipo === 'cliente' ? 
    Client.sanitizeClient(user) : 
    Seller.sanitizeSeller(user);

  res.status(200).json({
    message: 'Perfil obtido com sucesso',
    user: { ...sanitizedUser, tipo: req.user.tipo }
  });
}));

/**
 * GET /api/auth/clients
 * Listar todos os clientes (rota protegida para teste)
 */
router.get('/clients', verifyToken, asyncHandler(async (req, res) => {
  const clients = await Client.findAll();
  
  res.status(200).json({
    message: 'Clientes obtidos com sucesso',
    clients: clients.map(client => ({ ...client, tipo: 'cliente' })),
    total: clients.length
  });
}));

/**
 * GET /api/auth/sellers
 * Listar todos os vendedores (rota protegida para teste)
 */
router.get('/sellers', verifyToken, asyncHandler(async (req, res) => {
  const sellers = await Seller.findAll();
  
  res.status(200).json({
    message: 'Vendedores obtidos com sucesso',
    sellers: sellers.map(seller => ({ ...seller, tipo: 'vendedor' })),
    total: sellers.length
  });
}));

/**
 * GET /api/auth/users
 * Listar todos os usuários (clientes e vendedores)
 */
router.get('/users', verifyToken, asyncHandler(async (req, res) => {
  const clients = await Client.findAll();
  const sellers = await Seller.findAll();
  
  const allUsers = [
    ...clients.map(client => ({ ...client, tipo: 'cliente' })),
    ...sellers.map(seller => ({ ...seller, tipo: 'vendedor' }))
  ];
  
  res.status(200).json({
    message: 'Usuários obtidos com sucesso',
    users: allUsers,
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