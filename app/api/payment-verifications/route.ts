import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/payment-verifications - 获取核验列表
// GET /api/payment-verifications?status=pending
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseServer
      .from('payment_verifications')
      .select('*, orders(id, order_number, total, status, created_at)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: '获取核验列表失败' }, { status: 500 });
    }

    // 统计数据
    const pending = (data || []).filter(r => r.status === 'pending').length;
    const approved = (data || []).filter(r => r.status === 'approved').length;
    const rejected = (data || []).filter(r => r.status === 'rejected').length;
    const totalAmount = (data || [])
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    return NextResponse.json({
      verifications: data || [],
      summary: { pending, approved, rejected, totalAmount },
    });
  } catch (err) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST /api/payment-verifications - 客户提交"已支付"确认
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, customer_name, customer_phone, amount, payment_channel } = body;

    if (!order_id || !payment_channel) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 检查是否已有核验记录
    const { data: existing } = await supabaseServer
      .from('payment_verifications')
      .select('id, status')
      .eq('order_id', order_id)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json({ error: '此订单已核验通过，无需重复提交' }, { status: 409 });
      }
      return NextResponse.json({ error: '此订单已有待核验记录，请等待商家审核' }, { status: 409 });
    }

    // 创建核验记录
    const { data, error } = await supabaseServer
      .from('payment_verifications')
      .insert({
        order_id,
        customer_name: customer_name || '匿名客户',
        customer_phone: customer_phone || '',
        amount: parseFloat(amount || 0),
        payment_channel,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '提交失败' }, { status: 500 });
    }

    // 更新订单状态
    await supabaseServer
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', order_id);

    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/payment-verifications - 商家核验通过/拒绝
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { verification_id, action, merchant_note } = body;

    if (!verification_id || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const orderStatus = action === 'approve' ? 'verified' : 'paid'; // verified=已核验, paid=待核验

    const { data: verification, error: updateError } = await supabaseServer
      .from('payment_verifications')
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        merchant_note: merchant_note || '',
      })
      .eq('id', verification_id)
      .select('order_id')
      .single();

    if (updateError || !verification) {
      return NextResponse.json({ error: '核验操作失败' }, { status: 500 });
    }

    // 更新关联订单
    await supabaseServer
      .from('orders')
      .update({
        payment_status: orderStatus,
        payment_verified_at: new Date().toISOString(),
      })
      .eq('id', verification.order_id);

    return NextResponse.json({ success: true, status: newStatus });

  } catch (err) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
