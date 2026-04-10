import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    let query = supabaseServer.from('services').select('*');

    if (category) {
      query = query.eq('category', category);
    }
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取服务列表失败' }, { status: 500 });
    }

    // 格式转换
    const services = data.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      duration: s.duration,
      price: s.price,
      category: s.category || '未分类',
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/services
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, price, category } = body;
    if (!name || duration === undefined || price === undefined) {
      return NextResponse.json({ error: '缺少必要字段: name, duration, price' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('services')
      .insert({
        name,
        description: description || '',
        duration,
        price,
        category: category || '未分类',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return NextResponse.json({ error: '创建服务失败' }, { status: 500 });
    }

    const newService = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      duration: data.duration,
      price: data.price,
      category: data.category || '未分类',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
  }
}

// PUT /api/services/[id]
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少参数 id' }, { status: 400 });
    }

    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('services')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新服务失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '服务未找到' }, { status: 404 });
    }

    const updated = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      duration: data.duration,
      price: data.price,
      category: data.category || '未分类',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({ service: updated });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
  }
}

// DELETE /api/services/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少参数 id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return NextResponse.json({ error: '删除服务失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '无效的请求' }, { status: 400 });
  }
}