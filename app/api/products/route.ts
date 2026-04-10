import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取产品列表失败' }, { status: 500 });
    }

    // 将数据库字段映射为前端期望的格式（保留兼容性）
    const products = data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.price, // 暂无原价字段，用现价代替
      category: product.category || '未分类',
      stock: product.stock || 0,
      imageColor: product.image_url ? 'from-blue-300 to-blue-400' : 'from-gray-300 to-gray-400', // 模拟颜色
      imageUrl: product.image_url || '',
      tags: [], // 暂无标签字段
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, stock, imageUrl } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: '缺少必要字段（name, price, stock）' }, { status: 400 });
    }

    // 插入数据库
    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        name,
        description: description || '',
        price,
        category: category || '未分类',
        stock,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return NextResponse.json({ error: '创建产品失败' }, { status: 500 });
    }

    // 返回前端兼容格式
    const newProduct = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      originalPrice: data.price,
      category: data.category || '未分类',
      stock: data.stock || 0,
      imageColor: data.image_url ? 'from-blue-300 to-blue-400' : 'from-gray-300 to-gray-400',
      imageUrl: data.image_url || '',
      tags: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少产品ID' }, { status: 400 });
    }

    // 只允许更新特定字段
    const allowedUpdates = ['name', 'description', 'price', 'category', 'stock', 'image_url'];
    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // 如果前端传了 imageUrl，映射到 image_url
    if (updates.imageUrl !== undefined) {
      filteredUpdates.image_url = updates.imageUrl;
    }

    const { data, error } = await supabaseServer
      .from('products')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新产品失败' }, { status: 500 });
    }

    // 返回前端兼容格式
    const updatedProduct = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      originalPrice: data.price,
      category: data.category || '未分类',
      stock: data.stock || 0,
      imageColor: data.image_url ? 'from-blue-300 to-blue-400' : 'from-gray-300 to-gray-400',
      imageUrl: data.image_url || '',
      tags: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少产品ID' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return NextResponse.json({ error: '删除产品失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 });
  }
}