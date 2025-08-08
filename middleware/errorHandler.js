/**
 * Middleware centralizado para tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: err.message,
      details: err.errors
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token malformado ou inválido'
    });
  }

  // Token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'Faça login novamente'
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }

  // Erro personalizado com status
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Erro na requisição',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Erro interno do servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Algo deu errado. Tente novamente mais tarde.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para capturar erros assíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Criar erro personalizado
 */
const createError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  errorHandler,
  asyncHandler,
  createError
};