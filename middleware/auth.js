const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Middleware para verificar e validar JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    // Verificar se há erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        message: 'Forneça o token no header Authorization'
      });
    }

    // Verificar formato: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Formato esperado: Bearer <token>'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar dados do usuário à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nome: decoded.nome,
      isSeller: decoded.isSeller,
      tipo: decoded.tipo,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token malformado ou inválido'
      });
    }
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro na validação do token'
    });
  }
};

/**
 * Middleware para verificar se o usuário é vendedor
 */
const requireVendedor = (req, res, next) => {
  if (!req.user.isSeller) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas vendedores podem acessar este recurso'
    });
  }
  next();
};

/**
 * Middleware para verificar se o usuário é cliente
 */
const requireCliente = (req, res, next) => {
  if (req.user.isSeller) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas clientes podem acessar este recurso'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireVendedor,
  requireCliente
};