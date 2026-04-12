import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/staff/dashboard?staff_id=xxx
// 返回指定员工的：今日预约 + 本周统计 + 待办
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');

    if (!staff_id) {
      return NextResponse.json({ error: '缺少 staff_id 参数' }, { status: 400 });
    }

    // 今天日期范围
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // 本周一/周日
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    // 1. 今日预约
    const { data: todayAppointments, error: todayErr } = await supabaseServer
      .from('appointments')
      .select(`
        id, appointment_date, start_time, end_time, status, notes,
        customers(name, phone),
        services(name, price, duration_minutes)
      `)
      .eq('staff_id', staff_id)
      .eq('appointment_date', todayStr)
      .order('start_time', { ascending: true });

    if (todayErr) {
      console.error('今日预约查询失败:', todayErr);
      return NextResponse.json({ error: '获取今日预约失败' }, { status: 500 });
    }

    // 2. 本周全部预约（统计用）
    const { data: weekAppointments, error: weekErr } = await supabaseServer
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('staff_id', staff_id)
      .gte('appointment_date', mondayStr)
      .lte('appointment_date', sundayStr);

    if (weekErr) {
      console.error('本周预约查询失败:', weekErr);
      return NextResponse.json({ error: '获取本周预约失败' }, { status: 500 });
    }

    // 3. 员工信息
    const { data: staffData, error: staffErr } = await supabaseServer
      .from('staff')
      .select('id, name, role, specialties')
      .eq('id', staff_id)
      .single();

    if (staffErr) {
      return NextResponse.json({ error: '员工不存在' }, { status: 404 });
    }

    // 4. 计算统计数据
    const totalWeek = weekAppointments?.length || 0;
    const completedWeek = weekAppointments?.filter(a => a.status === 'completed').length || 0;
    const pendingWeek = weekAppointments?.filter(a => a.status === 'pending').length || 0;
    const confirmedWeek = weekAppointments?.filter(a => a.status === 'confirmed').length || 0;

    // 本周收入（仅已完成）
    const { data: completedWithPrice } = await supabaseServer
      .from('appointments')
      .select(`
        id,
        services(price)
      `)
      .eq('staff_id', staff_id)
      .eq('status', 'completed')
      .gte('appointment_date', mondayStr)
      .lte('appointment_date', sundayStr);

    const weekEarnings = (completedWithPrice || [])
      .reduce((sum: number, a: any) => sum + (a.services?.price || 0), 0);

    // 5. 每日预约（本周）
    const dailyMap: Record<string, number> = {};
    for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }
    (weekAppointments || []).forEach((a: any) => {
      if (dailyMap[a.appointment_date] !== undefined) {
        dailyMap[a.appointment_date]++;
      }
    });

    const weekDaily = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      dayName: ['一', '二', '三', '四', '五', '六', '日'][new Date(date + 'T00:00:00').getDay() - 1] || '日',
      count,
    }));

    // 6. 近期待办（未来7天内 pending/confirmed）
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const { data: upcomingAppointments } = await supabaseServer
      .from('appointments')
      .select(`
        id, appointment_date, start_time, end_time, status,
        customers(name),
        services(name)
      `)
      .eq('staff_id', staff_id)
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_date', todayStr)
      .lte('appointment_date', nextWeek.toISOString().split('T')[0])
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10);

    return NextResponse.json({
      staff: staffData,
      today: {
        date: todayStr,
        appointments: todayAppointments || [],
        count: todayAppointments?.length || 0,
      },
      week: {
        start: mondayStr,
        end: sundayStr,
        total: totalWeek,
        completed: completedWeek,
        pending: pendingWeek,
        confirmed: confirmedWeek,
        earnings: weekEarnings,
        daily: weekDaily,
      },
      upcoming: upcomingAppointments || [],
    });

  } catch (err) {
    console.error('Staff dashboard error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/staff/dashboard - 更新预约状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, status } = body;

    if (!appointment_id || !status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointment_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ appointment: data });
  } catch (err) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
