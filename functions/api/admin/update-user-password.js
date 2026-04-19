export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = 'https://czvmhylvatlegobrxyrx.supabase.co';
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey', 'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { userId, newPassword } = await request.json();
    if (!userId || !newPassword) return new Response(JSON.stringify({ error: '缺少字段' }), { headers: corsHeaders, status: 400 });
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` },
      body: JSON.stringify({ password: newPassword })
    });
    if (!authRes.ok) {
      const err = await authRes.json();
      return new Response(JSON.stringify({ error: err.msg || '更新失败' }), { headers: corsHeaders, status: 400 });
    }
    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
}
export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, apikey' } });
}
