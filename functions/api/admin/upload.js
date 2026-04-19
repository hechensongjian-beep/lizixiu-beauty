export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = 'https://czvmhylvatlegobrxyrx.supabase.co';
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey', 'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Auth check
  const authHeader = request.headers.get('Authorization') || '';
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': authHeader, 'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
  });
  const user = await userRes.json();
  const role = user?.user_metadata?.role;
  if (role !== 'merchant' && role !== 'admin') {
    return new Response(JSON.stringify({ error: '无权限' }), { headers: corsHeaders, status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'product-images';

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: '缺少文件' }), { headers: corsHeaders, status: 400 });
    }

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return new Response(JSON.stringify({ error: '上传失败: ' + err }), { headers: corsHeaders, status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
    return new Response(JSON.stringify({ success: true, url: publicUrl }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, apikey' } });
}
