// Shared Supabase clients for Cloudflare Pages Functions
// These read from Cloudflare Pages Environment Variables (set in dashboard)

const SUPABASE_URL = 'https://czvmhylvatlegobrxyrx.supabase.co';

function createClient(supabaseKey) {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };
  return { url: SUPABASE_URL, headers, async query(table, params = {}) {
    const q = new URLSearchParams(params).toString();
    const r = await fetch(`${this.url}/rest/v1/${table}?${q}`, { headers: this.headers });
    return r.json();
  }, async insert(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST', headers: { ...this.headers, 'Prefer': 'return=representation' }, body: JSON.stringify(data)
    });
    return r.json();
  }, async update(table, data, match) {
    const q = new URLSearchParams(match).toString();
    const r = await fetch(`${this.url}/rest/v1/${table}?${q}`, {
      method: 'PATCH', headers: { ...this.headers, 'Prefer': 'return=representation' }, body: JSON.stringify(data)
    });
    return r.json();
  }, async delete(table, match) {
    const q = new URLSearchParams(match).toString();
    await fetch(`${this.url}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: this.headers });
    return { success: true };
  }};
}

export function getSupabaseAnon() {
  // NEXT_PUBLIC_SUPABASE_ANON_KEY is exposed to browser, but we need it server-side for CF functions
  // Since CF functions run server-side, use a placeholder that will be injected
  return createClient('ANON_KEY_PLACEHOLDER');
}

export function getSupabaseAdmin() {
  // SUPABASE_SERVICE_ROLE_KEY must be set as a Cloudflare Pages Environment Variable
  return createClient('SUPABASE_SERVICE_ROLE_KEY');
}
