import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/staff/schedule?date=YYYY-MM-DD
// 商家视角：某一天所有员工的预约情况
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const view = searchParams.get('view') || 'day'; // day | week

    // 1. 所有在职员工
    const { data: staffList, error: staffErr } = await supabaseServer
      .from('staff')
      .select('id, name, role, specialties, status')
      .eq('status', 'active')
      .order('name');

    if (staffErr) {
      return NextResponse.json({ error: '获取员工列表失败' }, { status: 500 });
    }

    // 2. 当天预约（包含服务+客户信息）
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: appointments, error: aptErr } = await supabaseServer
      .from('appointments')
      .select(`
        id, appointment_date, start_time, end_time, status, notes,
        customers(name, phone),
        services(name, price, duration_minutes),
        staff(name)
      `)
      .gte('appointment_date', date)
      .lte('appointment_date', date)
      .order('start_time', { ascending: true });

    if (aptErr) {
      return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 });
    }

    // 3. 按员工分组
    const scheduleMap: Record<string, any[]> = {};
    for (const s of (staffList || [])) {
      scheduleMap[s.id] = [];
    }
    for (const apt of (appointments || [])) {
      const sid = (apt as any).staff_id;
      if (scheduleMap[sid]) {
        scheduleMap[sid].push(apt);
      }
    }

    // 4. 如果是周视图
    let weekDates: string[] = [];
    if (view === 'week') {
      const d = new Date(date + 'T00:00:00');
      const dayOfWeek = d.getDay() || 7;
      d.setDate(d.getDate() - dayOfWeek + 1);
      for (let i = 0; i < 7; i++) {
        const nd = new Date(d);
        nd.setDate(d.getDate() + i);
        weekDates.push(nd.toISOString().split('T')[0]);
      }
    }

    return NextResponse.json({
      date,
      view,
      weekDates,
      staff: staffList || [],
      appointments: appointments || [],
      schedule: scheduleMap,
      summary: {
        totalStaff: (staffList || []).length,
        totalAppointments: (appointments || []).length,
        pending: (appointments || []).filter(a => a.status === 'pending').length,
        confirmed: (appointments || []).filter(a => a.status === 'confirmed').length,
        completed: (appointments || []).filter(a => a.status === 'completed').length,
        cancelled: (appointments || []).filter(a => a.status === 'cancelled').length,
      },
    });

  } catch (err) {
    console.error('Staff schedule API error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/staff/schedule - 调换员工分配
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, new_staff_id } = body;

    if (!appointment_id || !new_staff_id) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 检查目标员工是否存在且在职
    const { data: targetStaff } = await supabaseServer
      .from('staff')
      .select('id, name')
      .eq('id', new_staff_id)
      .eq('status', 'active')
      .single();

    if (!targetStaff) {
      return NextResponse.json({ error: '目标员工不存在或已停用' }, { status: 404 });
    }

    const { data, error } = await supabaseServer
      .from('appointments')
      .update({ staff_id: new_staff_id, updated_at: new Date().toISOString() })
      .eq('id', appointment_id)
      .select('*, staff(name), customers(name), services(name)')
      .single();

    if (error) {
      return NextResponse.json({ error: '调换失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: data });

  } catch (err) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
