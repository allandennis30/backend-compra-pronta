const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

/**
 * Inicializa o banco de dados verificando se as tabelas existem
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Verificando estrutura do banco de dados...');
    
    // Tentar fazer uma consulta simples na tabela users para verificar se existe
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      // Se a tabela não existe, tentar criar usando método alternativo
      if (error.message && error.message.includes('relation "users" does not exist')) {
        console.log('📋 Tabela users não encontrada, tentando criar...');
        await createTablesDirectly();
      } else {
        console.error('⚠️  Erro ao verificar tabela users:', error.message);
        console.log('💡 Execute o script SQL manualmente no painel do Supabase.');
        console.log('📖 Consulte: COMO_EXECUTAR_SCRIPT_SUPABASE.md');
      }
    } else {
      console.log('✅ Tabela users já existe e está acessível.');
      console.log('📊 Banco de dados pronto para uso.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    console.error('💡 Dica: Execute o script manualmente no painel do Supabase.');
    console.error('📖 Consulte: COMO_EXECUTAR_SCRIPT_SUPABASE.md');
    
    // Não interromper a aplicação, apenas avisar
    console.log('⚠️  Aplicação continuará, mas pode haver erros de banco de dados.');
  }
}

/**
 * Função alternativa para informar sobre criação manual
 */
async function createTablesDirectly() {
  console.log('🔧 Para criar as tabelas, execute os seguintes passos:');
  console.log('1. Acesse: https://supabase.com/dashboard');
  console.log('2. Selecione o projeto: feljoannoghnpbqhrsuv');
  console.log('3. Vá em SQL Editor');
  console.log('4. Execute o script: backend/database/create_tables.sql');
  console.log('5. Reinicie a aplicação');
  console.log('');
  console.log('📖 Guia completo: COMO_EXECUTAR_SCRIPT_SUPABASE.md');
  console.log('⚠️  A aplicação continuará, mas o cadastro pode não funcionar até que as tabelas sejam criadas.');
}

module.exports = {
  initializeDatabase,
  createTablesDirectly
};