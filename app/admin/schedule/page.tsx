'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { getStaffSchedule, updateStaffSchedule, getStaff, getAppointments, updateAppointmentStatus } from '@/lib/api';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialties?: string[];
  status: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  staff_id: string;
  customer_name?: string;
  customer_phone?: string;
  services?: { name: string; price: number; duration_minutes: number };
  staff?: { name: string };
}

interface ScheduleData {
  date: string;
  view: string;
  weekDates: string[];
  staff: Staff[];
  appointments: Appointment[];
  schedule: Record<string, Appointment[]>;
  summary: {
    totalStaff: number;
    totalAppointments: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

const TIMES = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30',
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'rgba(168,138,92,0.15) var(--primary)',
  confirmed: 'bg-[var(--primary)] border-[var(--primary)] text-white',
  completed: 'rgba(74,117,86,0.15) border-green-400 var(--sage)',
  cancelled: 'var(--background-secondary) rgba(201,168,124,0.3) var(--foreground-muted) line-through',
};

const STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

// 分配弹窗
function ReassignModal({
  appointment,
  staffList,
  onClose,
  onConfirm,
}: {
  appointment: Appointment;
  staffList: Staff[];
  onClose: () => void;
  onConfirm: (staffId: string) => void;
}) {
  const [targetId, setTargetId] = useState(appointment.staff_id);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 rgba(0,0,0,0.04)0 flex items-center justify-center z-50 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-white px-6 py-4">
          <h3 className="font-bold text-lg">调换负责员工</h3>
          <p className="text-white/80 text-sm mt-0.5">
            {appointment.services?.name} · {appointment.start_time?.substring(11, 16)}
          </p>
        </div>
        <div className="p-6">
          <p className="text-[var(--foreground-muted)] text-sm mb-4">
            当前：<span className="font-semibold text-[var(--foreground)]">{appointment.staff?.name}</span>
          </p>
          <p className="text-[var(--foreground)] font-medium mb-3">分配给：</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {staffList.map(s => (
              <button
                key={s.id}
                onClick={() => setTargetId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  targetId === s.id
                    ? 'border-[var(--primary)] bg-[var(--background)]'
                    : 'rgba(201,168,124,0.2) hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  targetId === s.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                }`}>
                  {s.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{s.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{s.role}</div>
                </div>
                {targetId === s.id && (
                  <svg className="ml-auto text-[var(--foreground)]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
          {appointment.customer_name && (
            <div className="mt-4 p-3 text-[var(--background-card)] rounded-xl">
              <div className="text-sm text-[var(--foreground-muted)] mb-1">客户信息</div>
              <div className="font-medium text-[var(--foreground)]">{appointment.customer_name}</div>
              {appointment.customer_phone && (
                <div className="text-sm text-[var(--foreground-muted)]">{appointment.customer_phone}</div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl font-medium hover:bg-[var(--background-secondary)] transition"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(targetId)}
            disabled={targetId === appointment.staff_id}
            className="flex-1 py-2.5 bg-[var(--primary-dark)] text-white rounded-xl font-medium hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            确认调换
          </button>
        </div>
      </div>
    </div>
  );
}

// 周视图单元格
function WeekCell({
  date,
  staffId,
  appointments,
  onStaffClick,
}: {
  date: string;
  staffId: string;
  appointments: Appointment[];
  onStaffClick: (staffId: string, date: string) => void;
}) {
  const staffApts = appointments.filter(
    a => a.start_time?.startsWith(date) && a.staff_id === staffId
  );
  return (
    <div
      onClick={() => onStaffClick(staffId, date)}
      className="min-h-[48px] p-1 border-r border-[var(--background-secondary)] cursor-pointer hover:bg-[var(--background-secondary)] transition"
    >
      {staffApts.slice(0, 2).map(apt => (
        <div
          key={apt.id}
          className={`text-sm px-1.5 py-0.5 rounded border-l-2 mb-0.5 truncate ${
            STATUS_COLORS[apt.status] || STATUS_COLORS.pending
          }`}
        >
          {apt.start_time?.substring(11, 16)} {apt.services?.name?.slice(0, 4)}
        </div>
      ))}
      {staffApts.length > 2 && (
        <div className="text-sm text-[var(--foreground-muted)] text-center">+{staffApts.length - 2}</div>
      )}
    </div>
  );
}

export default function AdminSchedulePage() {
  const { toast } = useToast();
    useEffect(() => { document.title = '排班管理 - 丽姿秀'; }, []);

const { role } = useAuth();
  const router = useRouter();
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[var(--foreground-muted)]">正在检查权限...</p>
        </div>
      </div>
    );
  }
    const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchSchedule = useCallback(async (date: string, v: string) => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, staffRes, aptRes] = await Promise.all([
        getStaffSchedule(date, v),
        getStaff(),
        getAppointments(),
      ]);
      const staff = staffRes?.staff || [];
      const appointments = aptRes?.appointments || [];
      const summary = {
        totalStaff: staff.length,
        totalAppointments: appointments.length,
        pending: appointments.filter((a: any) => a.status === 'pending').length,
        confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
        completed: appointments.filter((a: any) => a.status === 'completed').length,
        cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
      };
      const weekStart = new Date(date + 'T00:00:00');
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
      });
      const schedule: Record<string, any[]> = {};
      appointments.forEach((a: any) => {
        const key = a.start_time?.substring(0, 10) || date;
        if (!schedule[key]) schedule[key] = [];
        schedule[key].push(a);
      });
      setData({ date, view: v, weekDates, staff, appointments, schedule, summary } as ScheduleData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(currentDate, view);
  }, [currentDate, view, fetchSchedule]);

  // 日导航
  const navigateDay = (delta: number) => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // 周导航
  const navigateWeek = (delta: number) => {
    const d = new Date(currentDate + 'T00:00:00');
    const dayOfWeek = d.getDay() || 7;
    d.setDate(d.getDate() - dayOfWeek + 1 + delta * 7);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  // 获取某员工某时间的预约
  const getAptAt = (staffId: string, time: string): Appointment | null => {
    if (!data) return null;
    const staffApts = (data.schedule[staffId] || []).filter(a => {
      const aptTime = a.start_time?.substring(11, 16);
      return aptTime === time;
    });
    return staffApts[0] || null;
  };

  // 调换确认
  const handleReassign = async (newStaffId: string) => {
    if (!selectedApt) return;
    setReassigning(true);
    try {
      const result = await updateAppointmentStatus(selectedApt.id, 'confirmed');
      if (result.error) throw new Error(result.error);
      // Update staff_id if reassigned
      if (newStaffId !== selectedApt.staff_id) {
        await updateStaffSchedule(selectedApt.id, { staff_id: newStaffId });
      }
      await fetchSchedule(currentDate, view);
      setSelectedApt(null);
    } catch (e: any) {
      toast.info(e.message);
    } finally {
      setReassigning(false);
    }
  };

  // 统计颜色
  const filteredApts = filterStatus === 'all'
    ? data?.appointments || []
    : (data?.appointments || []).filter(a => a.status === filterStatus);

  // 周视图的7天
  const weekDays = data?.weekDates || [];
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--foreground-muted)] hover:text-[var(--foreground-muted)]">首页</Link>
            <span className="text-[var(--foreground-light)]">/</span>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">员工排班日历</h1>
          </div>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">商家视角 · 所有员工预约一览 · 支持调换分配</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--background-secondary)] transition"
          >
             数据面板
          </Link>
          <button
            onClick={() => fetchSchedule(currentDate, view)}
            disabled={loading}
            className="px-4 py-2 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--background-secondary)] disabled:opacity-50 transition"
          >
            {loading ? '刷新中..' : ''}
          </button>
        </div>
      </div>

      {/* 视图切换 + 筛选 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1 text-[var(--background-secondary)] rounded-xl p-1">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'day' ? 'bg-white shadow text-[var(--foreground)]' : 'var(--foreground-muted) hover:text-[var(--foreground)]'
            }`}
          >
            日视图
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'week' ? 'bg-white shadow text-[var(--foreground)]' : 'var(--foreground-muted) hover:text-[var(--foreground)]'
            }`}
          >
            周视图
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border rgba(201,168,124,0.2) rounded-lg px-3 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      {/* 日期导航 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}
          className="w-10 h-10 rounded-xl bg-white border rgba(201,168,124,0.2) flex items-center justify-center hover:bg-[var(--background-secondary)] hover:border-[var(--primary)] transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="text-center">
          <div className="text-xl font-bold text-[var(--foreground)]">
            {view === 'day'
              ? new Date(currentDate + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
              : `第${Math.ceil((new Date(currentDate + 'T00:00:00').getDate()) / 7)}周 · ${new Date(currentDate + 'T00:00:00').toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}`
            }
          </div>
          {isToday && <div className="text-sm text-[var(--foreground)] font-medium">今天</div>}
        </div>
        <button
          onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
          className="w-10 h-10 rounded-xl bg-white border rgba(201,168,124,0.2) flex items-center justify-center hover:bg-[var(--background-secondary)] hover:border-[var(--primary)] transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* 统计卡片 */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: '员工数', value: data.summary.totalStaff, color: 'from-[var(--primary)] to-[var(--primary-light)]', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: '总预约', value: data.summary.totalAppointments, color: 'from-[var(--accent)] to-[var(--primary)]', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { label: '待确认', value: data.summary.pending, color: 'from-[var(--accent)] to-[var(--primary)]', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: '已确认', value: data.summary.confirmed, color: 'from-[var(--accent)] to-[var(--accent)]', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg> },
            { label: '已完成', value: data.summary.completed, color: 'from-[var(--accent)] to-[var(--accent)]', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ].map(item => (
            <div key={item.label} className={`bg-gradient-to-br ${item.color} text-white rounded-xl p-4 shadow-sm`}>
              <div className="mb-2 opacity-80">{item.svg}</div>
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-sm opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="bg-[var(--rose)]/6 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-[var(--rose)]">{error}</p>
          <p className="text-sm text-[var(--rose)] mt-1">请检查 Supabase 数据库是否已创建必要的数据表</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--foreground-muted)]">加载排班数据中...</p>
          </div>
        </div>
      )}

      {/* ===== 日视图 ===== */}
      {!loading && view === 'day' && data && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 表头：员工列 */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `64px repeat(${data.staff.length}, minmax(160px, 1fr))` }}>
              <div></div>
              {data.staff.map(s => (
                <div key={s.id} className="bg-white border rgba(201,168,124,0.2) rounded-xl p-3 text-center shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--primary-light)] rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-1">
                    {s.name.slice(0, 2)}
                  </div>
                  <div className="font-bold text-[var(--foreground)] text-sm">{s.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{s.role}</div>
                  {s.specialties && s.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {s.specialties.slice(0, 2).map((spec, i) => (
                        <span key={i} className="text-sm bg-[var(--background)] text-[var(--foreground)] px-1.5 py-0.5 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-[var(--foreground-muted)] mt-1">
                    {data.schedule[s.id]?.length || 0}个预约
                  </div>
                </div>
              ))}
            </div>

            {/* 时间网格 */}
            <div className="bg-white border rgba(201,168,124,0.2) rounded-2xl overflow-hidden shadow-sm">
              {/* 时间列头 */}
              <div className="grid divide-x divide-[var(--background-secondary)]" style={{ gridTemplateColumns: '64px repeat(' + data.staff.length + ', 1fr)' }}>
                <div className="p-2 text-[var(--background-card)]"></div>
                {data.staff.map(s => (
                  <div key={s.id} className="p-2 text-[var(--background-card)] text-center border-l border-[var(--background-secondary)]">
                    <span className="text-sm font-semibold text-[var(--foreground-muted)]">
                      {data.schedule[s.id]?.filter(a => a.status !== 'cancelled').length || 0} 节
                    </span>
                  </div>
                ))}
              </div>

              {/* 时间行 */}
              {TIMES.map(time => (
                <div
                  key={time}
                  className="grid divide-x divide-[var(--background-secondary)] border-t border-[var(--background-secondary)]"
                  style={{ gridTemplateColumns: '64px repeat(' + data.staff.length + ', 1fr)' }}
                >
                  <div className="p-2 text-sm text-[var(--foreground-muted)] font-medium flex items-center">
                    {time}
                  </div>
                  {data.staff.map(s => {
                    const apt = getAptAt(s.id, time);
                    if (apt) {
                      const color = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                      return (
                        <div key={s.id} className="p-1 border-l border-[var(--background-secondary)]">
                          <button
                            onClick={() => setSelectedApt(apt)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg border-l-3 ${color} hover:opacity-80 transition text-sm cursor-pointer`}
                            title={`${apt.services?.name} · ${apt.customer_name || '客户'} · 点击调换`}
                          >
                            <div className="font-bold truncate">{apt.services?.name || '服务'}</div>
                            <div className="opacity-75 truncate">{apt.customer_name || '客户'}</div>
                            <div className="opacity-60">{apt.start_time?.substring(11, 16)}~{apt.end_time?.substring(11, 16)}</div>
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={s.id} className="p-1 border-l border-[var(--background-secondary)] min-h-[44px]"></div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 状态图例 */}
            <div className="flex gap-4 mt-4 flex-wrap">
              {Object.entries(STATUS_COLORS).map(([status, cls]) => (
                <div key={status} className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
                  {STATUS_LABEL[status] || status}
                </div>
              ))}
              <div className="text-sm text-[var(--foreground-muted)] self-center ml-2">点击预约可调换负责员工</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 周视图 ===== */}
      {!loading && view === 'week' && data && (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="bg-white border rgba(201,168,124,0.2) rounded-2xl overflow-hidden shadow-sm">
              {/* 表头 */}
              <div className="grid divide-x divide-[var(--background-secondary)] bg-gradient-to-r from-[var(--background)] to-white border-b rgba(201,168,124,0.2)"
                style={{ gridTemplateColumns: '100px repeat(' + (data.staff.length || 1) + ', 1fr)' }}>
                <div className="p-3 text-center font-bold text-[var(--foreground-muted)] text-sm">日期</div>
                {data.staff.map(s => (
                  <div key={s.id} className="p-3 text-center border-l border-[var(--background-secondary)]">
                    <div className="font-bold text-[var(--foreground)] text-sm">{s.name}</div>
                    <div className="text-sm text-[var(--foreground-muted)]">{s.role}</div>
                  </div>
                ))}
              </div>

              {/* 周数据行 */}
              {weekDays.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00');
                const isCurrentDay = d === currentDate;
                const isWeekend = idx >= 5;
                const bgClass = isCurrentDay ? 'rgba(201,168,124,0.1)' : isWeekend ? 'var(--background-card)/50' : '';
                return (
                  <div
                    key={d}
                    className={`grid divide-x divide-[var(--background-secondary)] border-t border-[var(--background-secondary)] ${bgClass}`}
                    style={{ gridTemplateColumns: '100px repeat(' + (data.staff.length || 1) + ', 1fr)' }}
                  >
                    <div className={`p-3 flex flex-col justify-center ${isCurrentDay ? 'text-[var(--foreground)]' : 'var(--foreground)'}`}>
                      <div className="font-bold text-sm">{dateObj.getDate()}日</div>
                      <div className="text-sm text-[var(--foreground-muted)]">周{dayNames[idx]}</div>
                      {isCurrentDay && <div className="text-sm text-[var(--foreground)] font-medium">今天</div>}
                    </div>
                    {data.staff.map(s => {
                      const count = (data.appointments || []).filter(
                        a => a.start_time?.startsWith(d) && a.staff_id === s.id && a.status !== 'cancelled'
                      ).length;
                      const pendingCount = (data.appointments || []).filter(
                        a => a.start_time?.startsWith(d) && a.staff_id === s.id && a.status === 'pending'
                      ).length;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setCurrentDate(d);
                            setView('day');
                          }}
                          className="p-3 border-l border-[var(--background-secondary)] cursor-pointer hover:bg-[var(--background-secondary)] transition min-h-[64px] flex flex-col justify-center"
                        >
                          {count === 0 ? (
                            <div className="text-sm text-[var(--foreground-light)] text-center">—</div>
                          ) : (
                            <div className="text-center">
                              <div className="text-xl font-semibold text-[var(--foreground)]">{count}</div>
                              <div className="text-sm text-[var(--foreground-muted)]">预约</div>
                              {pendingCount > 0 && (
                                <div className="text-sm text-[var(--primary-dark)] mt-0.5">({pendingCount}) 待确认</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 调换弹窗 */}
      {selectedApt && (
        <ReassignModal
          appointment={selectedApt}
          staffList={data?.staff || []}
          onClose={() => setSelectedApt(null)}
          onConfirm={handleReassign}
        />
      )}
    </div>
  );
}
