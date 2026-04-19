import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'staff', name, phone: phone || '' },
    });

    if (authErr || !authData.user) {
      return NextResponse.json({ error: authErr?.message || 'Failed to create auth user' }, { status: 500 });
    }

    const userId = authData.user.id;

    // 2. Insert into staff table
    const { error: staffErr } = await supabaseAdmin.from('staff').insert({
      id: userId,
      name,
      email,
      phone: phone || '',
      role: 'staff',
      is_active: true,
    });

    if (staffErr) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: staffErr.message || 'Failed to create staff record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { id: userId, email, name } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
