// Cloudflare Pages Function: /api/admin/update-user-password
// Updates a user's password via Supabase Auth admin API

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function jsonRes(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonRes({ error: 'Server configuration missing' }, 500);
  }

  const adminHeaders = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const { userId, newPassword } = await context.request.json();
    if (!userId || !newPassword) {
      return jsonRes({ error: 'Missing userId or newPassword' }, 400);
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      return jsonRes({ error: data.msg || data.message || 'Failed to update password' }, 500);
    }

    return jsonRes({ success: true });
  } catch (e: any) {
    return jsonRes({ error: e.message }, 500);
  }
};
