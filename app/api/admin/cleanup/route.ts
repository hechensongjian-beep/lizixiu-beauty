import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取当前清理策略
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }
    
    // 获取清理策略
    const { data: setting } = await supabase
      .from('system_settings')
      .select('value, updated_at')
      .eq('key', 'order_cleanup_policy')
      .single();
      
    return NextResponse.json({
      policy: setting?.value || {
        enabled: false,
        period: '6months',
        auto_delete: false,
        last_cleanup: null
      },
      updated_at: setting?.updated_at || null
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// 更新清理策略
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }
    
    const body = await request.json();
    const { enabled, period, auto_delete } = body;
    
    // 验证参数
    if (!['1month', '6months', '1year', 'custom'].includes(period)) {
      return NextResponse.json({ error: '无效的清理周期' }, { status: 400 });
    }
    
    // 更新策略
    const { error } = await supabase
      .from('system_settings')
      .update({
        value: {
          enabled,
          period,
          auto_delete,
          last_cleanup: null
        },
        updated_by: user.id
      })
      .eq('key', 'order_cleanup_policy');
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, message: '清理策略已更新' });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新失败' },
      { status: 500 }
    );
  }
}

// 预览将要清理的订单（不实际删除）
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }
    
    const body = await request.json();
    const { period } = body;
    
    // 计算截止日期
    let cutoffDate = new Date();
    switch (period) {
      case '1month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '6months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      default:
        return NextResponse.json({ error: '无效的清理周期' }, { status: 400 });
    }
    
    // 查询将要清理的订单
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('id, created_at, status, total_amount', { count: 'exact' })
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'cancelled']); // 只清理已完成或已取消的
      
    if (error) throw error;
    
    // 计算总金额
    const totalAmount = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    return NextResponse.json({
      preview: true,
      cutoff_date: cutoffDate.toISOString(),
      order_count: count || 0,
      total_amount: totalAmount,
      orders: orders || [],
      message: `将清理 ${count || 0} 条订单，涉及金额 ¥${totalAmount.toFixed(2)}`
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '预览失败' },
      { status: 500 }
    );
  }
}

// 执行清理（需要二次确认）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }
    
    const body = await request.json();
    const { period, confirmed, confirmation_text } = body;
    
    // 二次确认验证
    if (!confirmed || confirmation_text !== '我已确认订单信息无误，同意清理') {
      return NextResponse.json(
        { error: '请先确认订单信息，并输入确认文本' },
        { status: 400 }
      );
    }
    
    // 计算截止日期
    let cutoffDate = new Date();
    switch (period) {
      case '1month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '6months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      default:
        return NextResponse.json({ error: '无效的清理周期' }, { status: 400 });
    }
    
    // 先查询要删除的订单
    const { data: ordersToDelete } = await supabase
      .from('orders')
      .select('id')
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'cancelled']);
      
    if (!ordersToDelete || ordersToDelete.length === 0) {
      return NextResponse.json({ message: '没有需要清理的订单' });
    }
    
    const orderIds = ordersToDelete.map(o => o.id);
    
    // 先删除订单明细
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', orderIds);
      
    if (itemsError) throw itemsError;
    
    // 再删除订单
    const { error: ordersError, count } = await supabase
      .from('orders')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'cancelled']);
      
    if (ordersError) throw ordersError;
    
    // 更新最后清理时间
    await supabase
      .from('system_settings')
      .update({
        value: {
          enabled: false,
          period,
          auto_delete: false,
          last_cleanup: new Date().toISOString()
        },
        updated_by: user.id
      })
      .eq('key', 'order_cleanup_policy');
    
    return NextResponse.json({
      success: true,
      deleted_count: count,
      message: `成功清理 ${count} 条历史订单`
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '清理失败' },
      { status: 500 }
    );
  }
}
