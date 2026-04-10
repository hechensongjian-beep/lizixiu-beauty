import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customer_id = searchParams.get('customer_id');
    const staff_id = searchParams.get('staff_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabaseServer.from('appointments').select(`
      *,
      customers(name, phone),
      services(name),
      staff(name)
    `);

    if (status) {
      query = query.eq('status', status);
    }
    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }
    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }
    if (start_date) {
      query = query.gte('start_time', start_date);
    }
    if (end_date) {
      query = query.lte('end_time', end_date);
    }

    // 模拟角色权限：假设当前用户是客户，只能看到自己的预约
    // 实际中应从 auth token 解析用户 ID
    const currentUserRole = 'customer'; // 模拟值
    // 暂时注释掉，因为当前没有真实用户身份验证，且模拟的 customer_id 与数据库 UUID 不匹配
    // const currentUserId = '1'; // 模拟当前用户 ID
    // if (currentUserRole === 'customer') {
    //   query = query.eq('customer_id', currentUserId);
    // }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 });
    }

    // 将数据库字段名转换为前端期望的格式（保持兼容）
    const appointments = data.map(apt => ({
      id: apt.id,
      customer_id: apt.customer_id,
      service_id: apt.service_id,
      staff_id: apt.staff_id,
      start_time: apt.start_time,
      end_time: apt.end_time,
      appointment_time: apt.start_time, // 兼容前端字段
      status: apt.status,
      notes: apt.notes || '',
      created_at: apt.created_at,
      updated_at: apt.updated_at,
      // 扩展字段，供前端直接显示
      customer_name: apt.customers?.name || '',
      phone: apt.customers?.phone || '',
      service_type: apt.services?.name || '',
      staff_name: apt.staff?.name || '',
    }));

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const required = ['customer_id', 'service_id', 'staff_id', 'start_time', 'end_time'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `缺少必要字段: ${field}` }, { status: 400 });
      }
    }

    // 验证时间冲突（查询数据库）
    const { data: conflicting } = await supabaseServer
      .from('appointments')
      .select('*')
      .eq('staff_id', body.staff_id)
      .neq('status', 'cancelled')
      .lt('start_time', body.end_time)
      .gt('end_time', body.start_time)
      .maybeSingle();

    if (conflicting) {
      return NextResponse.json(
        { error: '该员工在该时间段已有预约', conflict: conflicting },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseServer
      .from('appointments')
      .insert({
        customer_id: body.customer_id,
        service_id: body.service_id,
        staff_id: body.staff_id,
        start_time: body.start_time,
        end_time: body.end_time,
        status: body.status || 'pending',
        notes: body.notes || '',
      })
      .select('*, customers(name, phone), services(name), staff(name)')
      .single();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return NextResponse.json({ error: '创建预约失败' }, { status: 500 });
    }

    // 模拟发送提醒
    console.log(`[REMINDER] 新预约创建: ${data.id}, 客户 ${data.customer_id}`);

    // 返回格式化数据（与 GET 格式保持一致）
    const newAppointment = {
      id: data.id,
      customer_id: data.customer_id,
      service_id: data.service_id,
      staff_id: data.staff_id,
      start_time: data.start_time,
      end_time: data.end_time,
      appointment_time: data.start_time, // 兼容前端字段
      status: data.status,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // 扩展字段，供前端直接显示
      customer_name: data.customers?.name || '',
      phone: data.customers?.phone || '',
      service_type: data.services?.name || '',
      staff_name: data.staff?.name || '',
    };

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的 JSON 数据' }, { status: 400 });
  }
}

// PUT /api/appointments/[id]
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少预约 ID' }, { status: 400 });
    }

    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('appointments')
      .update(body)
      .eq('id', id)
      .select('*, customers(name, phone), services(name), staff(name)')
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新预约失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    const updated = {
      id: data.id,
      customer_id: data.customer_id,
      service_id: data.service_id,
      staff_id: data.staff_id,
      start_time: data.start_time,
      end_time: data.end_time,
      appointment_time: data.start_time, // 兼容前端字段
      status: data.status,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // 扩展字段，供前端直接显示
      customer_name: data.customers?.name || '',
      phone: data.customers?.phone || '',
      service_type: data.services?.name || '',
      staff_name: data.staff?.name || '',
    };

    return NextResponse.json(updated);
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的 JSON 数据' }, { status: 400 });
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少预约 ID' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return NextResponse.json({ error: '删除预约失败' }, { status: 500 });
    }

    return NextResponse.json({ message: '预约已取消' });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}