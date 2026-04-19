export async function onRequest(context) {
  const { request, env } = context;
  const SUPABASE_URL = 'https://czvmhylvatlegobrxyrx.supabase.co';
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey', 'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = request.headers.get('Authorization') || '';
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': authHeader, 'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
  });
  const user = await userRes.json();
  const role = user?.user_metadata?.role;
  if (role !== 'merchant' && role !== 'admin') {
    return new Response(JSON.stringify({ error: '无权限' }), { headers: corsHeaders, status: 403 });
  }

  const headers = { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };

  if (request.method === 'GET') {
    const data = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?is_active=eq.true&select=*&order=sort_order.asc`, { headers }).then(r => r.json());
    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    // Support update (has id) vs create (no id)
    if (body.id) {
      const { id, ...update } = body;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?id=eq.${id}`, {
        method: 'PATCH', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(update)
      });
      const data = await r.json();
      return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });
    } else {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/testimonials`, {
        method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(body)
      });
      const data = await r.json();
      return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });
    }
  }

  if (request.method === 'DELETE') {
    const { id } = await request.json();
    await fetch(`${SUPABASE_URL}/rest/v1/testimonials?id=eq.${id}`, { method: 'DELETE', headers });
    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: '不支持的方法' }), { headers: corsHeaders, status: 405 });
}
