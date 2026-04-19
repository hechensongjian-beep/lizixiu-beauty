// Cloudflare Pages Function: /api/admin/create-staff
// Creates a staff user via Supabase Auth + staff table

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
    const { email, password, name, phone } = await context.request.json();
    if (!email || !password || !name) {
      return jsonRes({ error: 'Missing required fields' }, 400);
    }

    // 1. Create auth user
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'staff', name, phone: phone || '' },
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      return jsonRes({ error: authData.msg || authData.message || 'Failed to create auth user' }, 500);
    }

    const userId = authData.id;

    // 2. Insert into staff table
    const staffRes = await fetch(`${SUPABASE_URL}/rest/v1/staff`, {
      method: 'POST',
      headers: { ...adminHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({ id: userId, name, email, phone: phone || '', role: 'staff', is_active: true }),
    });

    if (!staffRes.ok) {
      // Rollback: delete auth user
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const staffErr = await staffRes.json();
      return jsonRes({ error: staffErr.message || 'Failed to create staff record' }, 500);
    }

    return jsonRes({ success: true, user: { id: userId, email, name } });
  } catch (e: any) {
    return jsonRes({ error: e.message }, 500);
  }
};
