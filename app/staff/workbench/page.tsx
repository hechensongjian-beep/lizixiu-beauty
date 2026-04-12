'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 加载员工列表
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/staff?active=true');
      const data = await res.json();
      // 兼容返回格式
      const list = Array.isArray(data) ? data : (data.staff || data.data || []);
      setStaffList(list);
    } catch {
      setError('加载员工列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载工作台数据
  const fetchDashboard = useCallback(async (staffId: string) => {
    setDashboardLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/dashboard?staff_id=${staffId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '加载失败');
      }
      const data = await res.json();
      setDashboard(data);
      // 记住选择
      localStorage.setItem('staff_workbench_id', staffId);
    } catch (e: any) {
      setError(e.message || '加载工作台失败');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // 初始化
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

  // 切换员工
  const handleSelectStaff = (id: string) => {
    setSelectedStaffId(id);
    setDashboard(null);
    fetchDashboard(id);
  };

  // 切换角色（返回）
  const handleBack = () => {
    localStorage.removeItem('staff_workbench_id');
    setSelectedStaffId(null);
    setDashboard(null);
  };

  // 更新预约状态
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId);
    try {
      const res = await fetch('/api/staff/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, status: newStatus }),
      });
      if (!res.ok) throw new Error('更新失败');
      // 刷新数据
      if (selectedStaffId) fetchDashboard(selectedStaffId);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 格式化时间
  const fmtTime = (t: string) => t?.substring(0, 5) || '--:--';

  // 今日日期显示
  const todayDisplay = dashboard?.today.date
    ? new Date(dashboard.today.date + 'T00:00:00').toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  // 最大每日预约数（用于柱状图高度）
  const maxDaily = dashboard?.week.daily.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  // === 员工选择界面 ===
  if (!selectedStaffId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">👩‍💼</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">员工工作台</h1>
          <p className="text-gray-600">请选择您的账号，进入个人工作台</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.length === 0 && !loading && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">暂无可用员工账号</p>
                <p className="text-sm text-gray-400 mt-1">请联系商家添加员工</p>
              </div>
            )}
            {staffList.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStaff(s.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-700">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.role}</div>
                </div>
                <div className="text-purple-500">→</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  // === 工作台加载中 ===
  if (dashboardLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // === 工作台出错 ===
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">加载失败</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => selectedStaffId && fetchDashboard(selectedStaffId)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:opacity-90">
            重试
          </button>
          <button onClick={handleBack}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
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
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">👩‍💼</span>
            <h1 className="text-2xl font-bold text-gray-900">
              {dashboard?.staff?.name}的工作台
            </h1>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {dashboard?.staff?.role}
            </span>
          </div>
          <p className="text-gray-500 text-sm ml-9">{todayDisplay}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => selectedStaffId && fetchDashboard(selectedStaffId)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            🔄 刷新
          </button>
          <button
            onClick={handleBack}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            🔁 切换账号
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-gray-400 text-xl mb-2">📅</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{dashboard?.today.count}</div>
          <div className="text-sm text-gray-500">今日预约</div>
          {dashboard?.today.appointments.filter(a => a.status === 'completed').length !== undefined && (
            <div className="text-xs text-green-600 mt-1">
              已完成 {dashboard.today.appointments.filter(a => a.status === 'completed').length} 单
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-gray-400 text-xl mb-2">✅</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{dashboard?.week.completed}</div>
          <div className="text-sm text-gray-500">本周完成</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-gray-400 text-xl mb-2">💰</div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            ¥{dashboard?.week.earnings?.toLocaleString('zh-CN', { minimumFractionDigits: 0 }) || 0}
          </div>
          <div className="text-sm text-gray-500">本周收入</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-gray-400 text-xl mb-2">⏳</div>
          <div className="text-3xl font-bold text-amber-600 mb-1">
            {(dashboard?.week.pending || 0) + (dashboard?.week.confirmed || 0)}
          </div>
          <div className="text-sm text-gray-500">待服务</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧：今日预约详情 */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🌟 今日服务日程
              <span className="ml-auto text-sm font-normal text-gray-500">
                {dashboard?.today.appointments.length || 0} 个预约
              </span>
            </h2>

            {dashboard?.today.appointments.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500">今日暂无预约安排</p>
                <p className="text-sm text-gray-400 mt-1">好好休息或联系商家</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.today.appointments.map((apt) => {
                  const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                  const duration = apt.services?.duration_minutes || 60;
                  return (
                    <div key={apt.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-200 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-lg">
                              {fmtTime(apt.start_time)} - {fmtTime(apt.end_time)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="text-gray-800 font-medium mb-1">
                            {apt.services?.name || '服务项目'}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>👤 {apt.customers?.name || '客户'}</span>
                            {apt.customers?.phone && (
                              <span>📞 {apt.customers.phone}</span>
                            )}
                            <span>⏱ {duration}分钟</span>
                          </div>
                          {apt.notes && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                              📝 {apt.notes}
                            </div>
                          )}
                        </div>

                        {/* 状态操作按钮 */}
                        <div className="flex flex-col gap-1 min-w-[90px]">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                disabled={updatingId === apt.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 disabled:opacity-50 transition"
                              >
                                {updatingId === apt.id ? '处理中...' : '✓ 确认'}
                              </button>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                disabled={updatingId === apt.id}
                                className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                              >
                                ✕ 取消
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'completed')}
                              disabled={updatingId === apt.id}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 transition"
                            >
                              {updatingId === apt.id ? '处理中...' : '✓ 完成'}
                            </button>
                          )}
                          {(apt.status === 'completed' || apt.status === 'cancelled') && (
                            <span className="text-xs text-gray-400 text-center">
                              已{sc.label}
                            </span>
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 近期待办
              <span className="ml-auto text-sm font-normal text-gray-500">
                未来7天
              </span>
            </h2>

            {dashboard?.upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-gray-500">近期暂无预约安排</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard?.upcoming.slice(0, 5).map((apt) => {
                  const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-900 w-24 shrink-0">
                        {apt.appointment_date?.substring(5)}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        {apt.services?.name || '服务'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {apt.customers?.name || '客户'}
                      </div>
                      <div className="ml-auto">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：本周柱状图 */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">本周工作概览</h2>

            {/* 简单柱状图 */}
            <div className="flex items-end gap-2 h-32 mb-4">
              {dashboard?.week.daily.map((d) => {
                const h = maxDaily > 0 ? Math.max((d.count / maxDaily) * 100, d.count > 0 ? 15 : 0) : 0;
                const isToday = d.date === dashboard?.today.date;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: `${h}%`, minHeight: d.count > 0 ? '4px' : '0' }}>
                      {d.count > 0 && (
                        <div className={`w-full rounded-t-md transition-all ${isToday ? 'bg-purple-500' : 'bg-blue-300'}`}
                          style={{ height: '100%' }}></div>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>
                      {d.dayName}
                    </span>
                    <span className={`text-xs font-bold ${isToday ? 'text-purple-700' : 'text-gray-400'}`}>
                      {d.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 本周数据 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">本周总预约</span>
                <span className="font-bold text-gray-900">{dashboard?.week.total}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">已完成</span>
                <span className="font-bold text-green-600">{dashboard?.week.completed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">已确认</span>
                <span className="font-bold text-blue-600">{dashboard?.week.confirmed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">待确认</span>
                <span className="font-bold text-amber-600">{dashboard?.week.pending}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">本周收入</span>
                <span className="font-bold text-green-700">
                  ¥{dashboard?.week.earnings?.toLocaleString('zh-CN') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* 专长技能 */}
          {dashboard?.staff?.specialties && dashboard.staff.specialties.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💡 我的专长</h2>
              <div className="flex flex-wrap gap-2">
                {dashboard.staff.specialties.map((spec, i) => (
                  <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
