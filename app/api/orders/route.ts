import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data: orders, error } = await supabaseServer
      .from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
    const formattedOrders = (orders || []).map(order => ({
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email || '',
      shippingAddress: order.shipping_address || '',
      items: (order.order_items || []).map((item: any) => ({
        id: item.id, productId: item.product_id, name: item.name,
        price: parseFloat(item.price), quantity: item.quantity,
      })),
      subtotal: parseFloat(order.subtotal || 0),
      shippingFee: parseFloat(order.shipping_fee || 0),
      tax: parseFloat(order.tax || 0),
      total: parseFloat(order.total || 0),
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));
    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }
    const subtotal = body.subtotal || body.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const shippingFee = body.shippingFee || (subtotal > 500 ? 0 : 15);
    const tax = body.tax || subtotal * 0.06;
    const total = body.total || subtotal + shippingFee + tax;

    const { data: orderData, error: orderError } = await supabaseServer
      .from('orders').insert({
        customer_name: body.customerName,
        customer_phone: body.customerPhone || '',
        customer_email: body.customerEmail || '',
        shipping_address: body.shippingAddress || '',
        subtotal, shipping_fee: shippingFee, tax, total, status: 'pending',
      }).select().single();

    if (orderError) return NextResponse.json({ error: '创建订单失败' }, { status: 500 });

    const orderItems = body.items.map((item: any) => ({
      order_id: orderData.id, product_id: item.productId,
      name: item.name, price: item.price, quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseServer.from('order_items').insert(orderItems);
    if (itemsError) {
      await supabaseServer.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json({ error: '创建订单项失败' }, { status: 500 });
    }

    for (const item of body.items) {
      const { data: product } = await supabaseServer.from('products').select('stock').eq('id', item.productId).single();
      if (product) {
        await supabaseServer.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId);
      }
    }

    const { data: fullOrder } = await supabaseServer.from('orders').select('*, order_items(*)').eq('id', orderData.id).single();
    return NextResponse.json({
      success: true,
      order: {
        id: fullOrder.id, customerName: fullOrder.customer_name,
        customerPhone: fullOrder.customer_phone, customerEmail: fullOrder.customer_email || '',
        shippingAddress: fullOrder.shipping_address || '',
        items: (fullOrder.order_items || []).map((item: any) => ({
          id: item.id, productId: item.product_id, name: item.name,
          price: parseFloat(item.price), quantity: item.quantity,
        })),
        subtotal: parseFloat(fullOrder.subtotal), shippingFee: parseFloat(fullOrder.shipping_fee),
        tax: parseFloat(fullOrder.tax), total: parseFloat(fullOrder.total),
        status: fullOrder.status, createdAt: fullOrder.created_at, updatedAt: fullOrder.updated_at,
      }
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id || !body.status) return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    const validStatus = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatus.includes(body.status)) return NextResponse.json({ error: '无效状态' }, { status: 400 });
    const { data, error } = await supabaseServer.from('orders')
      .update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
    return NextResponse.json({ success: true, order: { id: data.id, status: data.status } });
  } catch (error) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
