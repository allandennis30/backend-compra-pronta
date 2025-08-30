const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key para operações de backend (bypassa RLS)
// Se não tiver service role key, use a anon key (mas pode ter problemas com RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: SUPABASE_URL e SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

console.log('🔧 [SUPABASE] Conectando com:', {
  url: supabaseUrl,
  keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon',
  keyPreview: supabaseKey.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;