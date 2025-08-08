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
 * Gerar JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    tipo: user.tipo
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'compra-pronta-api',
    audience: 'compra-pronta-app'
  });
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

  // Buscar usuário
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  // Verificar senha
  const isValidPassword = await User.verifyPassword(senha, user.senha);
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  // Gerar token
  const token = generateToken(user);
  
  // Remover dados sensíveis
  const sanitizedUser = User.sanitizeUser(user);

  res.status(200).json({
    message: 'Login realizado com sucesso',
    token,
    user: sanitizedUser,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * POST /api/auth/verify
 * Verificar se o token é válido
 */
router.post('/verify', verifyToken, asyncHandler(async (req, res) => {
  // Se chegou até aqui, o token é válido
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = User.sanitizeUser(user);

  res.status(200).json({
    message: 'Token válido',
    user: sanitizedUser,
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
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  // Gerar novo token
  const newToken = generateToken(user);
  const sanitizedUser = User.sanitizeUser(user);

  res.status(200).json({
    message: 'Token renovado com sucesso',
    token: newToken,
    user: sanitizedUser,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}));

/**
 * GET /api/auth/profile
 * Obter perfil do usuário autenticado
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }

  const sanitizedUser = User.sanitizeUser(user);

  res.status(200).json({
    message: 'Perfil obtido com sucesso',
    user: sanitizedUser
  });
}));

/**
 * GET /api/auth/users
 * Listar todos os usuários (rota protegida para teste)
 */
router.get('/users', verifyToken, asyncHandler(async (req, res) => {
  const users = await User.findAll();
  
  res.status(200).json({
    message: 'Usuários obtidos com sucesso',
    users,
    total: users.length
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