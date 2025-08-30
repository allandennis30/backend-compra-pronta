const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyTokenWithValidation, requireVendedor, requireCliente } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// Validações para login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para registro de cliente
const clientRegisterValidation = [
  body('nome').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('telefone').isLength({ min: 10, max: 15 }).withMessage('Telefone deve ter entre 10 e 15 caracteres'),
  body('endereco.rua').isLength({ min: 2, max: 100 }).withMessage('Rua deve ter entre 2 e 100 caracteres'),
  body('endereco.numero').isLength({ min: 1, max: 10 }).withMessage('Número deve ter entre 1 e 10 caracteres'),
  body('endereco.bairro').isLength({ min: 2, max: 100 }).withMessage('Bairro deve ter entre 2 e 100 caracteres'),
  body('endereco.cidade').isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  body('endereco.estado').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('endereco.cep').isLength({ min: 8, max: 9 }).withMessage('CEP deve ter entre 8 e 9 caracteres')
];

// Validações para registro de vendedor
const sellerRegisterValidation = [
  body('nome').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('telefone').isLength({ min: 10, max: 15 }).withMessage('Telefone deve ter entre 10 e 15 caracteres'),
  body('endereco.rua').isLength({ min: 2, max: 100 }).withMessage('Rua deve ter entre 2 e 100 caracteres'),
  body('endereco.numero').isLength({ min: 1, max: 10 }).withMessage('Número deve ter entre 1 e 10 caracteres'),
  body('endereco.bairro').isLength({ min: 2, max: 100 }).withMessage('Bairro deve ter entre 2 e 100 caracteres'),
  body('endereco.cidade').isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  body('endereco.estado').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('endereco.cep').isLength({ min: 8, max: 9 }).withMessage('CEP deve ter entre 8 e 9 caracteres')
];

/**
 * Gerar token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      nome: user.nome,
      isSeller: user.isSeller,
      tipo: user.isSeller ? 'vendedor' : 'cliente'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Buscar usuário por email
 */
const findUserByEmail = async (email) => {
  // Primeiro, tentar encontrar como cliente
  let user = await User.findOne({ email, isSeller: false });
  if (user) {
    return { user, type: 'cliente' };
  }

  // Se não encontrou como cliente, tentar como vendedor
  user = await User.findOne({ email, isSeller: true });
  if (user) {
    return { user, type: 'vendedor' };
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
router.post('/register/client', clientRegisterValidation, asyncHandler(async (req, res) => {
  console.log('📝 [REGISTER/CLIENT] Tentativa de registro:', req.body.email);
  
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [REGISTER/CLIENT] Erros de validação:', errors.array());
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, telefone, endereco, latitude, longitude } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ [REGISTER/CLIENT] Email já existe:', email);
      return res.status(409).json({
        error: 'Email já existe',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Criar cliente
    const clientData = {
      nome,
      email,
      senha: hashedPassword,
      telefone,
      endereco: endereco || {},
      latitude: latitude || 0,
      longitude: longitude || 0,
      isSeller: false
    };

    const newClient = await User.create(clientData);
    
    // Gerar token
    const token = generateToken(newClient);
    
    // Remover dados sensíveis
    const sanitizedClient = newClient.toJSON();

    console.log('✅ [REGISTER/CLIENT] Cliente criado com sucesso:', email);
    res.status(201).json({
      message: 'Cliente criado com sucesso',
      token,
      user: { ...sanitizedClient, tipo: 'cliente' },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('💥 [REGISTER/CLIENT] ERRO CRÍTICO durante registro:', error);
    throw error;
  }
}));

/**
 * POST /api/auth/register/seller
 * Registrar novo vendedor
 */
router.post('/register/seller', sellerRegisterValidation, asyncHandler(async (req, res) => {
  console.log('📝 [REGISTER/SELLER] Tentativa de registro:', req.body.email);
  
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [REGISTER/SELLER] Erros de validação:', errors.array());
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, telefone, endereco, latitude, longitude } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ [REGISTER/SELLER] Email já existe:', email);
      return res.status(409).json({
        error: 'Email já existe',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Criar vendedor
    const sellerData = {
      nome,
      email,
      senha: hashedPassword,
      telefone,
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

    console.log('✅ [REGISTER/SELLER] Vendedor criado com sucesso:', email);
    res.status(201).json({
      message: 'Vendedor criado com sucesso',
      token,
      user: { ...sanitizedSeller, tipo: 'vendedor' },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('💥 [REGISTER/SELLER] ERRO CRÍTICO durante registro:', error);
    throw error;
  }
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
  const clients = await User.find({ isSeller: false });
  
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
  const sellers = await User.find({ isSeller: true });
  
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
  const allUsers = await User.find();
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