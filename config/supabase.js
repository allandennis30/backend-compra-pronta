const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Fallback stub para desenvolvimento sem Supabase configurado
  const chain = {
    _op: null,
    select() { return this; },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
    eq() { return this; },
    neq() { return this; },
    single() { return Promise.resolve({ data: null, error: { code: 'NO_SUPABASE', message: 'Supabase não configurado' } }); },
    maybeSingle() { return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found (stub)' } }); },
    select() { return this; },
    limit() { return this; },
    range() { return this; }
  };

  const stub = {
    from() { return chain; }
  };

  module.exports = stub;
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}