export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = 'https://czvmhylvatlegobrxyrx.supabase.co';
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, password, name, role } = await request.json();
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), { headers: corsHeaders, status: 400 });
    }

    // Create user via Supabase Auth Admin API
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email, password,
        user_metadata: { name, role: role || 'staff' }
      })
    });
    const authData = await authRes.json();
    if (!authRes.ok) {
      return new Response(JSON.stringify({ error: authData.msg || '创建用户失败' }), { headers: corsHeaders, status: 400 });
    }

    const userId = authData.id;

    // Insert into staff table
    await fetch(`${SUPABASE_URL}/rest/v1/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ id: userId, name, email, role: role || 'staff' })
    });

    return new Response(JSON.stringify({ success: true, userId, email }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, apikey',
    }
  });
}
