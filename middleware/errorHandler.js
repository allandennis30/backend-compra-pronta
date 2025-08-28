/**
 * Middleware centralizado para tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 [ERROR_HANDLER] Erro capturado pelo middleware');
  console.error('📍 [ERROR_HANDLER] URL:', req.url);
  console.error('🔧 [ERROR_HANDLER] Método:', req.method);
  console.error('🌐 [ERROR_HANDLER] IP:', req.ip);
  console.error('⏰ [ERROR_HANDLER] Timestamp:', new Date().toISOString());
  console.error('📝 [ERROR_HANDLER] Body da requisição:', JSON.stringify(req.body, null, 2));
  console.error('📋 [ERROR_HANDLER] Headers:', JSON.stringify(req.headers, null, 2));
  console.error('💥 [ERROR_HANDLER] Mensagem do erro:', err.message);
  console.error('🔍 [ERROR_HANDLER] Tipo do erro:', err.constructor.name);
  console.error('📚 [ERROR_HANDLER] Stack trace:', err.stack);
  
  // Log adicional para erros específicos
  if (err.code) {
    console.error('🔢 [ERROR_HANDLER] Código do erro:', err.code);
  }
  if (err.details) {
    console.error('📋 [ERROR_HANDLER] Detalhes do erro:', err.details);
  }
  if (err.hint) {
    console.error('💡 [ERROR_HANDLER] Dica do erro:', err.hint);
  }

  // Erro de validação do express-validator
  if (err.name === 'ValidationError') {
    console.log('✅ [ERROR_HANDLER] Tratando como erro de validação');
    return res.status(400).json({
      error: 'Dados inválidos',
      message: err.message,
      details: err.errors
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    console.log('✅ [ERROR_HANDLER] Tratando como erro de JWT');
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token malformado ou inválido'
    });
  }

  // Token expirado
  if (err.name === 'TokenExpiredError') {
    console.log('✅ [ERROR_HANDLER] Tratando como erro de token expirado');
    return res.status(401).json({
      error: 'Token expirado',
      message: 'Faça login novamente'
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.log('✅ [ERROR_HANDLER] Tratando como erro de sintaxe JSON');
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }

  // Erro personalizado com status
  if (err.status) {
    console.log('✅ [ERROR_HANDLER] Tratando como erro personalizado com status:', err.status);
    return res.status(err.status).json({
      error: err.message || 'Erro na requisição',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Erro interno do servidor
  console.log('❌ [ERROR_HANDLER] Tratando como erro interno do servidor (500)');
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