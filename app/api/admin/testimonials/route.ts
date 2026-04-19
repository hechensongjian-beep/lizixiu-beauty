import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { action, payload, id } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      case 'create': {
        if (!payload) return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
        const { data, error } = await supabaseAdmin.from('testimonials').insert(payload).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'update': {
        if (!id || !payload) return NextResponse.json({ error: 'Missing id or payload' }, { status: 400 });
        const { data, error } = await supabaseAdmin.from('testimonials').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'delete': {
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
