'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';
import { getStaff, getStaffDashboard, updateAppointmentStatus } from '@/lib/api';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialties?: string[];
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  customers?: { name: string; phone?: string };
  services?: { name: string; price: number; duration_minutes: number };
}

interface DayStat {
  date: string;
  dayName: string;
  count: number;
}

interface DashboardData {
  staff: Staff;
  today: {
    date: string;
    appointments: Appointment[];
    count: number;
  };
  week: {
    start: string;
    end: string;
    total: number;
    completed: number;
    pending: number;
    confirmed: number;
    earnings: number;
    daily: DayStat[];
  };
  upcoming: Appointment[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: '待确认' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已确认' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: '已取消' },
};

export default function StaffWorkbenchPage() {
  const router = useRouter();
  const { role, mounted } = useRole();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && role !== 'staff') {
      router.push('/auth/staff-login');
    }
  }, [mounted, role, router]);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await getStaff();
      setStaffList(data?.staff || []);
    } catch {
      setError('加载员工列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async (staffId: string) => {
    setDashboardLoading(true);
    setError(null);
    try {
      const data = await getStaffDashboard(staffId);
      if (data.error) throw new Error(data.error);
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = data.todayAppointments || [];
      const weekStart = new Date(today + 'T00:00:00');
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const daily: DayStat[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        return {
          date: ds,
          dayName: ['日','一','二','三','四','五','六'][d.getDay()],
          count: todayAppts.filter((a: any) => a.start_time?.startsWith(ds)).length,
        };
      });
      const ws = data.weeklyStats || {};
      setDashboard({
        staff: { id: staffId, name: '', role: '' },
        today: { date: today, appointments: todayAppts, count: todayAppts.length },
        week: {
          start: weekStart.toISOString().split('T')[0], end: '',
          total: ws.completedCount || 0, completed: ws.completedCount || 0,
          pending: ws.pendingCount || 0, confirmed: 0,
          earnings: ws.revenue || 0, daily,
        },
        upcoming: todayAppts.filter((a: any) => a.status === 'confirmed' || a.status === 'pending'),
      } as DashboardData);
      localStorage.setItem('staff_workbench_id', staffId);
    } catch (e: any) {
      setError(e.message || '加载工作台失败');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    const savedId = localStorage.getItem('staff_workbench_id');
    if (savedId) {
      setSelectedStaffId(savedId);
      fetchDashboard(savedId);
    } else {
      setLoading(false);
    }
  }, [fetchStaff, fetchDashboard]);

  const handleSelectStaff = (id: string) => {
    setSelectedStaffId(id);
    setDashboard(null);
    fetchDashboard(id);
  };

  const handleBack = () => {
    localStorage.removeItem('staff_workbench_id');
    setSelectedStaffId(null);
    setDashboard(null);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId);
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.error) throw new Error(result.error);
      if (selectedStaffId) fetchDashboard(selectedStaffId);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtTime = (t: string) => t?.substring(0, 5) || '--:--';
  const todayDisplay = dashboard?.today.date
    ? new Date(dashboard.today.date + 'T00:00:00').toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';
  const maxDaily = dashboard?.week.daily.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  // === 未挂载或非员工角色 ===
  if (!mounted || role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--primary)] mb-3"></div>
          <p className="text-[var(--foreground-muted)] text-sm">验证员工身份...</p>
        </div>
      </div>
    );
  }

  // === 员工选择界面 ===
  if (!selectedStaffId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-3xl text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>员工工作台</h1>
          <p className="text-[var(--foreground-muted)]">请选择您的账号，进入个人工作台</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-white rounded-xl border border-[var(--primary-light)]"></div>
            ))}
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--primary-light)]">
            <p className="text-[var(--foreground-muted)]">暂无可用员工账号</p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1 opacity-60">请联系商家添加员工</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStaff(s.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-[var(--primary-light)] rounded-xl hover:shadow-md hover:-translate-y-0.5 transition text-left"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ background: 'var(--primary)' }}>
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[var(--foreground)]">{s.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{s.role}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)]">返回首页</Link>
        </div>
      </div>
    );
  }

  // === 工作台加载中 ===
  if (dashboardLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white rounded border border-[var(--primary-light)]"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-[var(--primary-light)]"></div>)}
          </div>
          <div className="h-64 bg-white rounded-2xl border border-[var(--primary-light)]"></div>
        </div>
      </div>
    );
  }

  // === 工作台出错 ===
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-xl text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>加载失败</h2>
        <p className="text-[var(--foreground-muted)] mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => selectedStaffId && fetchDashboard(selectedStaffId)}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:shadow-md transition-all" style={{ background: 'var(--primary)' }}>
            重试
          </button>
          <button onClick={handleBack}
            className="px-6 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm text-[var(--foreground-muted)] hover:bg-[var(--primary-light)] transition-all">
            切换账号
          </button>
        </div>
      </div>
    );
  }

  // === 工作台主视图 ===
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>
            {dashboard?.staff?.name}的工作台
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">{todayDisplay}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => selectedStaffId && fetchDashboard(selectedStaffId)}
            className="px-3 py-1.5 text-sm border border-[var(--primary-light)] rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--primary-light)] transition-all">
            刷新
          </button>
          <button onClick={handleBack}
            className="px-3 py-1.5 text-sm border border-[var(--primary-light)] rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--primary-light)] transition-all">
            切换账号
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5">
          <p className="text-xs text-[var(--foreground-muted)] mb-1">今日预约</p>
          <div className="text-3xl font-bold text-[var(--foreground)] mb-1">{dashboard?.today.count}</div>
          <div className="text-xs text-green-600">
            已完成 {dashboard?.today.appointments.filter((a: Appointment) => a.status === 'completed').length || 0} 单
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5">
          <p className="text-xs text-[var(--foreground-muted)] mb-1">本周完成</p>
          <div className="text-3xl font-bold text-[var(--primary)]">{dashboard?.week.completed}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5">
          <p className="text-xs text-[var(--foreground-muted)] mb-1">本周收入</p>
          <div className="text-3xl font-bold text-green-600">
            {(dashboard?.week.earnings || 0).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5">
          <p className="text-xs text-[var(--foreground-muted)] mb-1">待服务</p>
          <div className="text-3xl font-bold text-amber-600">
            {(dashboard?.week.pending || 0) + (dashboard?.week.confirmed || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧 */}
        <div className="lg:col-span-3 space-y-5">
          {/* 今日预约 */}
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-4 flex items-center justify-between">
              今日服务日程
              <span className="text-xs text-[var(--foreground-muted)]">{dashboard?.today.appointments.length || 0} 个预约</span>
            </h2>

            {dashboard?.today.appointments.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p className="text-[var(--foreground-muted)]">今日暂无预约安排</p>
                <p className="text-xs text-[var(--foreground-muted)] mt-1 opacity-60">好好休息或联系商家</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.today.appointments.map((apt) => {
                  const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                  const duration = apt.services?.duration_minutes || 60;
                  return (
                    <div key={apt.id} className="border border-[var(--primary-light)] rounded-xl p-4 hover:shadow-sm transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[var(--foreground)] text-base">{fmtTime(apt.start_time)} - {fmtTime(apt.end_time)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                          </div>
                          <div className="text-sm font-medium text-[var(--foreground)] mb-1">{apt.services?.name || '服务项目'}</div>
                          <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                            <span>{apt.customers?.name || '客户'}</span>
                            {apt.customers?.phone && <span>{apt.customers.phone}</span>}
                            <span>{duration}分钟</span>
                          </div>
                          {apt.notes && (
                            <div className="mt-2 text-xs text-[var(--foreground-muted)] bg-[var(--primary-light)] rounded-lg p-2">{apt.notes}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-[90px]">
                          {apt.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                disabled={updatingId === apt.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 disabled:opacity-50 transition">
                                {updatingId === apt.id ? '处理中...' : '确认'}
                              </button>
                              <button onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                disabled={updatingId === apt.id}
                                className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition">
                                取消
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button onClick={() => handleStatusChange(apt.id, 'completed')}
                              disabled={updatingId === apt.id}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 transition">
                              {updatingId === apt.id ? '处理中...' : '完成'}
                            </button>
                          )}
                          {(apt.status === 'completed' || apt.status === 'cancelled') && (
                            <span className="text-xs text-[var(--foreground-muted)] text-center">已{sc.label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 近期待办 */}
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-4 flex items-center justify-between">
              近期待办
              <span className="text-xs text-[var(--foreground-muted)]">未来7天</span>
            </h2>

            {dashboard?.upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--foreground-muted)] text-sm">近期暂无预约安排</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard?.upcoming.slice(0, 5).map((apt) => {
                  const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--primary-light)' }}>
                      <span className="text-xs font-medium text-[var(--foreground)] w-20 shrink-0">{apt.appointment_date?.substring(5)}</span>
                      <span className="text-sm font-medium text-[var(--foreground)] flex-1">{apt.services?.name || '服务'}</span>
                      <span className="text-xs text-[var(--foreground-muted)]">{apt.customers?.name || '客户'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 本周柱状图 */}
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-5">本周工作概览</h2>
            <div className="flex items-end gap-2 h-32 mb-4">
              {dashboard?.week.daily.map((d) => {
                const h = maxDaily > 0 ? Math.max((d.count / maxDaily) * 100, d.count > 0 ? 15 : 0) : 0;
                const isToday = d.date === dashboard?.today.date;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: `${h}%`, minHeight: d.count > 0 ? '4px' : '0' }}>
                      <div className="w-full rounded-t-md" style={{ height: '100%', background: isToday ? 'var(--primary)' : '#e8d5b8' }}></div>
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`}>{d.dayName}</span>
                    <span className={`text-xs font-bold ${isToday ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`}>{d.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              {[
                { label: '本周总预约', value: dashboard?.week.total },
                { label: '已完成', value: dashboard?.week.completed, color: 'text-green-600' },
                { label: '已确认', value: dashboard?.week.confirmed, color: 'text-blue-600' },
                { label: '待确认', value: dashboard?.week.pending, color: 'text-amber-600' },
                { label: '本周收入', value: `¥${(dashboard?.week.earnings || 0).toLocaleString('zh-CN')}`, color: 'text-green-700' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-[var(--primary-light)] last:border-0">
                  <span className="text-sm text-[var(--foreground-muted)]">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color || 'text-[var(--foreground)]'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 专长 */}
          {dashboard?.staff?.specialties && dashboard.staff.specialties.length > 0 && (
            <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
              <h2 className="text-base font-medium text-[var(--foreground)] mb-3">我的专长</h2>
              <div className="flex flex-wrap gap-2">
                {dashboard.staff.specialties.map((spec, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)]">返回首页</Link>
      </div>
    </div>
  );
}
