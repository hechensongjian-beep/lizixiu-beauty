'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

useEffect(() => { document.title = '排班管理 - 丽姿秀'; }, []);
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
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
  pending: 'bg-amber-100 border-amber-400 text-amber-900',
  confirmed: 'bg-blue-100 border-blue-400 text-blue-900',
  completed: 'bg-green-100 border-green-400 text-green-900',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-500 line-through',
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4a3e] to-[#c9a87c] text-white px-6 py-4">
          <h3 className="font-bold text-lg">调换负责员工</h3>
          <p className="text-white/80 text-sm mt-0.5">
            {appointment.services?.name} · {appointment.start_time?.substring(11, 16)}
          </p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            当前：<span className="font-semibold text-gray-900">{appointment.staff?.name}</span>
          </p>
          <p className="text-gray-700 font-medium mb-3">分配给：</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {staffList.map(s => (
              <button
                key={s.id}
                onClick={() => setTargetId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  targetId === s.id
                    ? 'border-[#c9a87c] bg-[#faf8f5]'
                    : 'border-gray-200 hover:border-[#e8d5b8] hover:bg-[#faf8f5]/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  targetId === s.id ? 'bg-[#faf8f5]0 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {s.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.role}</div>
                </div>
                {targetId === s.id && (
                  <span className="ml-auto text-[#c9a87c] text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
          {appointment.customer_name && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">客户信息</div>
              <div className="font-medium text-gray-900">{appointment.customer_name}</div>
              {appointment.customer_phone && (
                <div className="text-sm text-gray-600">{appointment.customer_phone}</div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(targetId)}
            disabled={targetId === appointment.staff_id}
            className="flex-1 py-2.5 bg-[#a88a5c] text-white rounded-xl font-medium hover:bg-[#2d4a3e] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
      className="min-h-[48px] p-1 border-r border-gray-100 cursor-pointer hover:bg-[#faf8f5] transition"
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
        <div className="text-sm text-gray-400 text-center">+{staffApts.length - 2}</div>
      )}
    </div>
  );
}

export default function AdminSchedulePage() {
  const { role } = useAuth();
  const router = useRouter();
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">正在检查权限...</p>
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
      alert(e.message);
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
            <Link href="/" className="text-gray-400 hover:text-gray-600">首页</Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-2xl font-bold text-gray-900">员工排班日历</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">商家视角 · 所有员工预约一览 · 支持调换分配</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition"
          >
             数据面板
          </Link>
          <button
            onClick={() => fetchSchedule(currentDate, view)}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {loading ? '刷新中..' : ''}
          </button>
        </div>
      </div>

      {/* 视图切换 + 筛选 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'day' ? 'bg-white shadow text-[#a88a5c]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            日视图
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              view === 'week' ? 'bg-white shadow text-[#a88a5c]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            周视图
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
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
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-[#faf8f5] hover:border-[#c9a87c] transition"
        >
          ←
        </button>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {view === 'day'
              ? new Date(currentDate + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
              : `第${Math.ceil((new Date(currentDate + 'T00:00:00').getDate()) / 7)}周 · ${new Date(currentDate + 'T00:00:00').toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}`
            }
          </div>
          {isToday && <div className="text-sm text-[#c9a87c] font-medium">今天</div>}
        </div>
        <button
          onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-[#faf8f5] hover:border-[#c9a87c] transition"
        >
          →
        </button>
      </div>

      {/* 统计卡片 */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: '员工数', value: data.summary.totalStaff, color: 'from-[#c9a87c] to-[#e8d5b8]', icon: '⏱' },
            { label: '总预约', value: data.summary.totalAppointments, color: 'from-blue-400 to-blue-600', icon: '⏱' },
            { label: '待确认', value: data.summary.pending, color: 'from-amber-400 to-amber-600', icon: '⏱' },
            { label: '已确认', value: data.summary.confirmed, color: 'from-indigo-400 to-indigo-600', icon: '✓' },
            { label: '已完成', value: data.summary.completed, color: 'from-green-400 to-green-600', icon: '⏱' },
          ].map(item => (
            <div key={item.label} className={`bg-gradient-to-br ${item.color} text-white rounded-xl p-4 shadow-sm`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-3xl font-bold">{item.value}</div>
              <div className="text-sm opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-500 mt-1">请检查 Supabase 数据库是否已创建必要的数据表</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl animate-pulse mb-3">...</div>
            <p className="text-gray-500">加载排班数据中...</p>
          </div>
        </div>
      )}

      {/* ===== 日视图 ===== */}
      {!loading && view === 'day' && data && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 表头：员工列 */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '64px repeat(${data.staff.length}, minmax(160px, 1fr))' }}>
              <div></div>
              {data.staff.map(s => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2d4a3e] to-[#e8d5b8] rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-1">
                    {s.name.slice(0, 2)}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.role}</div>
                  {s.specialties && s.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {s.specialties.slice(0, 2).map((spec, i) => (
                        <span key={i} className="text-sm bg-[#faf8f5] text-[#a88a5c] px-1.5 py-0.5 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mt-1">
                    {data.schedule[s.id]?.length || 0}个预约
                  </div>
                </div>
              ))}
            </div>

            {/* 时间网格 */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* 时间列头 */}
              <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: '64px repeat(' + data.staff.length + ', 1fr)' }}>
                <div className="p-2 bg-gray-50"></div>
                {data.staff.map(s => (
                  <div key={s.id} className="p-2 bg-gray-50 text-center border-l border-gray-100">
                    <span className="text-sm font-semibold text-gray-500">
                      {data.schedule[s.id]?.filter(a => a.status !== 'cancelled').length || 0} 节
                    </span>
                  </div>
                ))}
              </div>

              {/* 时间行 */}
              {TIMES.map(time => (
                <div
                  key={time}
                  className="grid divide-x divide-gray-100 border-t border-gray-100"
                  style={{ gridTemplateColumns: '64px repeat(' + data.staff.length + ', 1fr)' }}
                >
                  <div className="p-2 text-sm text-gray-400 font-medium flex items-center">
                    {time}
                  </div>
                  {data.staff.map(s => {
                    const apt = getAptAt(s.id, time);
                    if (apt) {
                      const color = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                      return (
                        <div key={s.id} className="p-1 border-l border-gray-100">
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
                      <div key={s.id} className="p-1 border-l border-gray-100 min-h-[44px]"></div>
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
              <div className="text-sm text-gray-400 self-center ml-2">点击预约可调换负责员工</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 周视图 ===== */}
      {!loading && view === 'week' && data && (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* 表头 */}
              <div className="grid divide-x divide-gray-100 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200"
                style={{ gridTemplateColumns: '100px repeat(' + (data.staff.length || 1) + ', 1fr)' }}>
                <div className="p-3 text-center font-bold text-gray-600 text-sm">日期</div>
                {data.staff.map(s => (
                  <div key={s.id} className="p-3 text-center border-l border-gray-100">
                    <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.role}</div>
                  </div>
                ))}
              </div>

              {/* 周数据行 */}
              {weekDays.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00');
                const isCurrentDay = d === currentDate;
                const isWeekend = idx >= 5;
                const bgClass = isCurrentDay ? 'bg-[#c9a87c]/10' : isWeekend ? 'bg-gray-50/50' : '';
                return (
                  <div
                    key={d}
                    className={`grid divide-x divide-gray-100 border-t border-gray-100 ${bgClass}`}
                    style={{ gridTemplateColumns: '100px repeat(' + (data.staff.length || 1) + ', 1fr)' }}
                  >
                    <div className={`p-3 flex flex-col justify-center ${isCurrentDay ? 'text-[#a88a5c]' : 'text-gray-700'}`}>
                      <div className="font-bold text-sm">{dateObj.getDate()}日</div>
                      <div className="text-sm text-gray-500">周{dayNames[idx]}</div>
                      {isCurrentDay && <div className="text-sm text-[#c9a87c] font-medium">今天</div>}
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
                          className="p-3 border-l border-gray-100 cursor-pointer hover:bg-[#faf8f5] transition min-h-[64px] flex flex-col justify-center"
                        >
                          {count === 0 ? (
                            <div className="text-sm text-gray-300 text-center">—</div>
                          ) : (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{count}</div>
                              <div className="text-sm text-gray-500">预约</div>
                              {pendingCount > 0 && (
                                <div className="text-sm text-amber-600 mt-0.5">({pendingCount}) 待确认</div>
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
