const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar trust proxy para produção (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Configurações de segurança
app.use(helmet());

// Rate limiting será aplicado apenas nas rotas específicas se necessário

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://localhost:9000'
];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como apps móveis)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas as origens em desenvolvimento
    }
  },
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging simplificado
app.use((req, res, next) => {
  // Log apenas requisições importantes (não health check)
  if (!req.url.includes('/health')) {
    console.log(`📍 [${req.method}] ${req.url} - IP: ${req.ip}`);
    
    // Log do body apenas para POST/PUT e sem headers verbosos
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
      console.log('📝 [BODY]:', JSON.stringify(req.body, null, 2));
    }
  }
  
  // Log da resposta apenas para erros (4xx, 5xx)
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400 && !req.url.includes('/health')) {
      console.log(`❌ [${res.statusCode}] ${req.method} ${req.url}:`, data);
    } else if (res.statusCode >= 200 && res.statusCode < 300 && !req.url.includes('/health')) {
      console.log(`✅ [${res.statusCode}] ${req.method} ${req.url}`);
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Inicializar banco de dados
  await initializeDatabase();
});

module.exports = app;