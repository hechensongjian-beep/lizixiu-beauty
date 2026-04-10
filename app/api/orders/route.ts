import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getProducts, reduceProductStock } from '@/lib/memoryStorage'; // 暂时保留用于库存检查

export async function GET() {
  try {
    // 查询订单及其订单项
    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 查询错误:', error);
      return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
    }

    // 将数据库格式转换为前端期望的格式
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email || '',
      shippingAddress: order.shipping_address || '',
      items: order.order_items.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: parseFloat(order.subtotal),
      shippingFee: parseFloat(order.shipping_fee),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 简单验证
    if (!body.customerName || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: '缺少必要字段：customerName 或 items' },
        { status: 400 }
      );
    }

    // TODO: 使用 Supabase 事务处理订单创建与库存扣减
    // 暂时保持内存存储逻辑（后续升级）
    const products = getProducts();
    // 检查库存并扣减
    for (const item of body.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `商品不存在: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `商品 "${product.name}" 库存不足，仅剩 ${product.stock} 件` },
          { status: 400 }
        );
      }
    }

    // 扣减库存
    for (const item of body.items) {
      const success = reduceProductStock(item.productId, item.quantity);
      if (!success) {
        return NextResponse.json(
          { error: `扣减库存失败: ${item.productId}` },
          { status: 500 }
        );
      }
    }

    // 插入订单到数据库
    const { data: orderData, error: orderError } = await supabaseServer
      .from('orders')
      .insert({
        customer_name: body.customerName,
        customer_phone: body.customerPhone || '',
        customer_email: body.customerEmail || '',
        shipping_address: body.shippingAddress || '',
        subtotal: body.subtotal || 0,
        shipping_fee: body.shippingFee || 0,
        tax: body.tax || 0,
        total: body.total || 0,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Supabase 订单插入错误:', orderError);
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
    }

    // 插入订单项
    const orderItems = body.items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseServer
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Supabase 订单项插入错误:', itemsError);
      // 尝试删除已插入的订单（回滚）
      await supabaseServer.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json({ error: '创建订单项失败' }, { status: 500 });
    }

    // 扣减真实库存（更新 products 表）
    for (const item of body.items) {
      const { error: stockError } = await supabaseServer
        .from('products')
        .update({ stock: supabaseServer.rpc('decrement', { x: item.quantity }) }) // 需要创建 RPC 函数或直接计算
        .eq('id', item.productId);

      // 简单扣减：先查询当前库存再更新
      const { data: product } = await supabaseServer
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single();

      if (product) {
        const newStock = product.stock - item.quantity;
        await supabaseServer
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId);
      }
    }

    // 返回完整订单数据（联查）
    const { data: fullOrder } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderData.id)
      .single();

    const formattedOrder = {
      id: fullOrder.id,
      customerName: fullOrder.customer_name,
      customerPhone: fullOrder.customer_phone,
      customerEmail: fullOrder.customer_email || '',
      shippingAddress: fullOrder.shipping_address || '',
      items: fullOrder.order_items.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: parseFloat(fullOrder.subtotal),
      shippingFee: parseFloat(fullOrder.shipping_fee),
      tax: parseFloat(fullOrder.tax),
      total: parseFloat(fullOrder.total),
      status: fullOrder.status,
      createdAt: fullOrder.created_at,
      updatedAt: fullOrder.updated_at,
    };

    return NextResponse.json(
      { success: true, order: formattedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: '缺少必要字段：id 或 status' },
        { status: 400 }
      );
    }

    // 验证状态值
    const validStatus = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatus.includes(body.status)) {
      return NextResponse.json(
        { error: `无效状态，允许的值: ${validStatus.join(', ')}` },
        { status: 400 }
      );
    }

    // 更新订单状态
    const { data, error } = await supabaseServer
      .from('orders')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
    }

    // 返回格式化订单
    const formattedOrder = {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email || '',
      shippingAddress: data.shipping_address || '',
      // 订单项需要额外查询，这里暂不包含
      subtotal: parseFloat(data.subtotal),
      shippingFee: parseFloat(data.shipping_fee),
      tax: parseFloat(data.tax),
      total: parseFloat(data.total),
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(
      { success: true, order: formattedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}