import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const phone = searchParams.get('phone');

    let query = supabaseServer.from('customers').select('*');

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,notes.ilike.%${q}%`);
    }
    if (phone) {
      query = query.eq('phone', phone);
    }



    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取客户列表失败' }, { status: 500 });
    }

    // 格式转换
    const customers = data.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      notes: c.notes || '',
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const required = ['name', 'phone'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `缺少必要字段: ${field}` }, { status: 400 });
      }
    }

    // 检查手机号是否已存在
    const { data: existing } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('phone', body.phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '手机号已存在' }, { status: 409 });
    }

    const { data, error } = await supabaseServer
      .from('customers')
      .insert({
        name: body.name,
        phone: body.phone,
        email: body.email || '',
        notes: body.notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return NextResponse.json({ error: '创建客户失败' }, { status: 500 });
    }

    const newCustomer = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的 JSON 数据' }, { status: 400 });
  }
}

// PUT /api/customers/[id]
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少客户 ID' }, { status: 400 });
    }

    const body = await request.json();
    // 不允许修改手机号（唯一标识）
    if (body.phone) {
      // 检查手机号是否与其他客户冲突
      const { data: existing } = await supabaseServer
        .from('customers')
        .select('id')
        .eq('phone', body.phone)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: '手机号已存在' }, { status: 409 });
      }
    }

    const { data, error } = await supabaseServer
      .from('customers')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新客户失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    const updated = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(updated);
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的 JSON 数据' }, { status: 400 });
  }
}

// DELETE /api/customers/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少客户 ID' }, { status: 400 });
    }

    // 检查是否有未完成的预约（查询 appointments 表）
    const { data: activeAppointments } = await supabaseServer
      .from('appointments')
      .select('id')
      .eq('customer_id', id)
      .neq('status', 'cancelled')
      .limit(1);

    if (activeAppointments && activeAppointments.length > 0) {
      return NextResponse.json({ error: '该客户有未完成预约，无法删除' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return NextResponse.json({ error: '删除客户失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}