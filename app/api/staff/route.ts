import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const q = searchParams.get('q');

    let query = supabaseServer.from('staff').select('*');

    if (role) {
      query = query.eq('role', role);
    }
    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,role.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取员工列表失败' }, { status: 500 });
    }

    // 模拟角色权限：只有管理员可以查看所有员工
    const currentUserRole = 'admin'; // 模拟值
    let staff = data;
    if (currentUserRole !== 'admin') {
      // 非管理员只能看到部分公开信息（如姓名、角色、头像）
      staff = data.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        avatar: s.avatar,
        // 新列（非敏感，可公开）
        specialties: s.specialties || [],
        experience_years: s.experience_years || 0,
        is_active: s.is_active ?? true,
      }));
    } else {
      staff = data.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        phone: s.phone || '',
        email: s.email || '',
        avatar: s.avatar || '/avatars/default.png',
        specialties: s.specialties || [],
        experience_years: s.experience_years || 0,
        is_active: s.is_active ?? true,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, phone, email, avatar } = body;
    if (!name || !role) {
      return NextResponse.json({ error: '缺少必要字段: name, role' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('staff')
      .insert({
        name,
        role,
        phone: phone || '',
        email: email || '',
        avatar: avatar || '/avatars/default.png',
        specialties: body.specialties || [],
        experience_years: body.experience_years || 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return NextResponse.json({ error: '创建员工失败' }, { status: 500 });
    }

    const newStaff = {
      id: data.id,
      name: data.name,
      role: data.role,
      phone: data.phone || '',
      email: data.email || '',
      avatar: data.avatar || '/avatars/default.png',
      specialties: data.specialties || [],
      experience_years: data.experience_years || 0,
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({ staff: newStaff }, { status: 201 });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
  }
}

// PUT /api/staff/[id]
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少参数 id' }, { status: 400 });
    }

    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('staff')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新员工失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '员工未找到' }, { status: 404 });
    }

    const updated = {
      id: data.id,
      name: data.name,
      role: data.role,
      phone: data.phone || '',
      email: data.email || '',
      avatar: data.avatar || '/avatars/default.png',
      specialties: data.specialties || [],
      experience_years: data.experience_years || 0,
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({ staff: updated });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
  }
}

// DELETE /api/staff/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少参数 id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return NextResponse.json({ error: '删除员工失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求' }, { status: 400 });
  }
}