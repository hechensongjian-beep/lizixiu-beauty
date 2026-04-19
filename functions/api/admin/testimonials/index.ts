// Cloudflare Pages Function: /api/admin/testimonials
// Handles CRUD for testimonials table

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

  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  try {
    const { action, payload, id } = await context.request.json();

    if (!action) return jsonRes({ error: 'Missing action' }, 400);

    switch (action) {
      case 'create': {
        if (!payload) return jsonRes({ error: 'Missing payload' }, 400);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials`, {
          method: 'POST', headers, body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return jsonRes({ error: data.message || 'Create failed' }, 500);
        return jsonRes({ data: Array.isArray(data) ? data[0] : data });
      }
      case 'update': {
        if (!id || !payload) return jsonRes({ error: 'Missing id or payload' }, 400);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?id=eq.${id}`, {
          method: 'PATCH', headers, body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return jsonRes({ error: data.message || 'Update failed' }, 500);
        return jsonRes({ data: Array.isArray(data) ? data[0] : data });
      }
      case 'delete': {
        if (!id) return jsonRes({ error: 'Missing id' }, 400);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?id=eq.${id}`, {
          method: 'DELETE', headers: { ...headers, 'Prefer': 'return=minimal' },
        });
        if (!res.ok) { const data = await res.json(); return jsonRes({ error: data.message || 'Delete failed' }, 500); }
        return jsonRes({ success: true });
      }
      default:
        return jsonRes({ error: 'Invalid action' }, 400);
    }
  } catch (e: any) {
    return jsonRes({ error: e.message }, 500);
  }
};
