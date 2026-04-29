'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAppointments, createAppointment, getCustomers, getServices, getStaff, updateAppointmentStatus, deleteAppointment } from '@/lib/api';

type Appointment = {
  id: string;
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_time: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
};

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newAppointment, setNewAppointment] = useState({
    customer_id: '',
    service_id: '',
    staff_id: '',
    appointment_date: '',
    appointment_time: '',
  });
  const [connectionError, setConnectionError] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // 测试 API 连接
  const testConnection = useCallback(async () => {
    try {
      const result = await getAppointments();
      return !result.error;
    } catch {
      return false;
    }
  }, []);

  // 加载客户、服务、员工选项
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [custData, servData, staffData] = await Promise.all([
          getCustomers(),
          getServices(),
          getStaff()
        ]);
        if (custData?.customers) setCustomers(custData.customers);
        if (servData?.services) setServices(servData.services);
        if (staffData?.staff) setStaff(staffData.staff);
      } catch (err) {
        console.error('加载选项失败:', err);
      }
    };
    fetchOptions();
  }, []);

  // 加载预约数据
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);

      const result = await getAppointments();
      const data = result.appointments || [];

      setAppointments(data);
      setFilteredAppointments(data);
    } catch (err: any) {
      const message = err.message || '加载失败';
      setError(message);
      if (message.includes('Failed to fetch') || message.includes('网络') || message.includes('连接')) {
        setConnectionError(true);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // 实时订阅（已禁用，API 不支持实时推送）
  useEffect(() => {
    // 可在此处添加轮询逻辑，如需实时更新
    // const interval = setInterval(fetchAppointments, 30000);
    // return () => clearInterval(interval);
  }, [fetchAppointments, connectionError]);

  // 搜索与过滤
  useEffect(() => {
    let filtered = appointments;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.customer_name.toLowerCase().includes(term) ||
        apt.phone.includes(term) ||
        apt.service_type.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // 验证手机号
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(phone);
  };

  const handleAdd = async () => {
    const { customer_id, service_id, staff_id, appointment_date, appointment_time } = newAppointment;
    if (!customer_id || !service_id || !staff_id || !appointment_date || !appointment_time) {
      alert('请填写所有字段');
      return;
    }

    const startTime = new Date(`${appointment_date}T${appointment_time}`);
    if (startTime < new Date()) {
      alert('预约时间不能是过去的时间');
      return;
    }
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    try {
      setIsAdding(true);
      const result = await createAppointment({
        customer_id,
        service_id,
        staff_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
      });
      if (result.success) {
        setAppointments([...appointments, result.appointment]);
        setNewAppointment({ customer_id: '', service_id: '', staff_id: '', appointment_date: '', appointment_time: '' });
        alert('预约添加成功！');
      } else {
        throw new Error(result.error || '添加失败');
      }
    } catch (err: any) {
      alert('添加失败: ' + err.message);
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    try {
      const result = await updateAppointmentStatus(id, newStatus);
      if (result.success) {
        setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
      } else {
        throw new Error(result.error || '更新状态失败');
      }
    } catch (err: any) {
      alert('更新状态失败: ' + err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该预约吗？')) return;
    try {
      const result = await deleteAppointment(id);
      if (result.success) {
        setAppointments(appointments.filter(apt => apt.id !== id));
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (err: any) {
      alert('删除失败: ' + err.message);
      console.error(err);
    }
  };

  // 导出为 CSV
  const exportToCSV = () => {
    if (appointments.length === 0) {
      alert('没有预约数据可导出');
      return;
    }
    const headers = ['客户姓名', '手机号', '服务项目', '预约时间', '状态', '创建时间'];
    const rows = appointments.map(apt => {
      const date = new Date(apt.appointment_time);
      return [
        apt.customer_name,
        apt.phone,
        apt.service_type,
        date.toLocaleString('zh-CN'),
        apt.status === 'pending' ? '待确认' : apt.status === 'confirmed' ? '已确认' : apt.status === 'completed' ? '已完成' : '已取消',
        apt.created_at ? new Date(apt.created_at).toLocaleString('zh-CN') : ''
      ];
    });
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `预约记录_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 格式化日期时间显示
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待确认' },
    { value: 'confirmed', label: '已确认' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  // 连接错误时的特殊 UI
  if (connectionError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="mb-6"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">数据库连接失败</h2>
          <p className="text-[var(--foreground)] mb-6">
            无法连接到 Supabase 数据库，这通常是因为您的 Supabase 项目处于<strong>暂停状态</strong>（免费项目在闲置7天后会自动暂停）。
          </p>
          <div className="bg-white rounded-xl p-6 border border-red-300 mb-8 text-left">
            <h3 className="font-semibold text-red-800 mb-3">请按以下步骤恢复：</h3>
            <ol className="list-decimal pl-5 space-y-2 text-[var(--foreground)]">
              <li>访问 <a href="https://supabase.com/dashboard" target="_blank" className="text-[var(--primary-dark)] hover:underline font-medium">Supabase 控制台</a></li>
              <li>选择项目 <code className="text-[var(--background-secondary)] px-2 py-1 rounded text-sm">jrdzmohjsteykvxszwve</code></li>
              <li>在左侧菜单点击 <strong>Database</strong> → <strong>Overview</strong></li>
              <li>如果看到暂停提示，点击 <strong>"Resume project"</strong>（恢复项目）</li>
              <li>等待1-2分钟，项目启动后刷新本页面</li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={fetchAppointments}
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> 重试连接
            </button>
            <a
              href="https://supabase.com/dashboard/project/jrdzmohjsteykvxszwve"
              target="_blank"
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              立即唤醒项目
            </a>
          </div>
          <p className="mt-6 text-[var(--foreground-muted)] text-sm">
            如果您需要帮助，请参考 <a href="https://supabase.com/docs/guides/platform/pause" target="_blank" className="text-[var(--primary-dark)] hover:underline">Supabase 暂停与恢复文档</a>。
          </p>
        </div>
      </div>
    );
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="animate-pulse">
        {/* 操作栏骨架 */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-80 h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="w-40 h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="w-32 h-12 text-[var(--background-secondary)] rounded-lg"></div>
          </div>
          <div className="w-24 h-6 text-[var(--background-secondary)] rounded"></div>
        </div>

        {/* 添加表单骨架 */}
        <div className="mb-8 p-6 text-[var(--background-card)] rounded-xl border rgba(201,168,124,0.2)">
          <div className="h-6 w-48 text-[var(--background-secondary)] rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="h-12 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="h-12 text-[var(--background-secondary)] rounded-lg"></div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="h-12 w-32 text-[var(--background-secondary)] rounded-lg"></div>
            <div className="h-4 w-64 text-[var(--background-secondary)] rounded"></div>
          </div>
        </div>

        {/* 表格骨架 */}
        <div className="overflow-x-auto rounded-xl border rgba(201,168,124,0.2)">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="text-[var(--background-card)]">
              <tr>
                {['客户', '手机号', '服务项目', '预约时间', '状态', '操作'].map((col) => (
                  <th key={col} className="px-6 py-3 text-left">
                    <div className="h-4 w-20 text-[var(--background-secondary)] rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--border)]">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-32 text-[var(--background-secondary)] rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 text-[var(--background-secondary)] rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-40 text-[var(--background-secondary)] rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-48 text-[var(--background-secondary)] rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 text-[var(--background-secondary)] rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 text-[var(--background-secondary)] rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="h-4 w-64 text-[var(--background-secondary)] rounded"></div>
          <div className="h-4 w-20 text-[var(--background-secondary)] rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !connectionError) {
    return (
      <div className="rgba(177,93,94,0.06) border border-red-200 text-[var(--rose)] p-6 rounded-xl max-w-2xl mx-auto">
        <p className="font-semibold mb-2">数据加载失败</p>
        <p className="mb-4">{error}</p>
        <button onClick={fetchAppointments} className="px-4 py-2 text-[var(--accent-light)] text-white rounded-lg hover:rgba(177,93,94,0.85) transition">
          重试加载
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 操作栏 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索客户、手机号、服务..."
              className="pl-10 pr-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
          </div>
          <select
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg hover:bg-[var(--background-card)] transition flex items-center space-x-2"
            title="导出为 Excel 可导入的 CSV 文件"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>导出 CSV</span>
          </button>
        </div>
        <div className="text-[var(--foreground-muted)]">
          共 <span className="font-bold text-[var(--foreground)]">{filteredAppointments.length}</span> 条预约记录
        </div>
      </div>

      {/* 添加预约表单 */}
      <div className="mb-8 p-6 text-[var(--background-card)] rounded-xl border rgba(201,168,124,0.2)">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">添加新预约</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={newAppointment.customer_id}
            onChange={(e) => setNewAppointment({ ...newAppointment, customer_id: e.target.value })}
          >
            <option value="">选择客户 *</option>
            {customers.map(cust => (
              <option key={cust.id} value={cust.id}>{cust.name} ({cust.phone})</option>
            ))}
          </select>
          <select
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={newAppointment.service_id}
            onChange={(e) => setNewAppointment({ ...newAppointment, service_id: e.target.value })}
          >
            <option value="">选择服务 *</option>
            {services.map(serv => (
              <option key={serv.id} value={serv.id}>{serv.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={newAppointment.staff_id}
            onChange={(e) => setNewAppointment({ ...newAppointment, staff_id: e.target.value })}
          >
            <option value="">选择员工 *</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={newAppointment.appointment_date}
            onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <input
            type="time"
            className="px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:text-[var(--rose)]-500 focus:border-transparent"
            value={newAppointment.appointment_time}
            onChange={(e) => setNewAppointment({ ...newAppointment, appointment_time: e.target.value })}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isAdding ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                添加中...
              </>
            ) : '添加预约'}
          </button>
          <span className="text-sm" style={{ color: 'var(--foreground-muted, #6b7280)' }}>选择客户、服务、员工 · 禁止选择过去时间</span>
        </div>
      </div>

      {/* 预约表格 */}
      <div className="overflow-x-auto rounded-xl border rgba(201,168,124,0.2)">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="text-[var(--background-card)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">客户</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">手机号</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">服务项目</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">预约时间</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[var(--border)]">
            {filteredAppointments.map((apt) => {
              const { date, time } = formatDateTime(apt.appointment_time);
              return (
                <tr key={apt.id} className="even:text-[var(--background-card)] hover:bg-[var(--background-secondary)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--foreground)]">{apt.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">{apt.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">{apt.service_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    <div className="font-medium">{date}</div>
                    <div className="text-sm text-[var(--foreground-muted)]">{time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${apt.status === 'confirmed' ? 'rgba(74,117,86,0.15) var(--sage)' : apt.status === 'pending' ? 'rgba(201,168,124,0.2) var(--foreground)' : apt.status === 'completed' ? 'rgba(201,168,124,0.15) var(--primary)' : 'rgba(177,93,94,0.15) var(--rose)'}`}
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value as Appointment['status'])}
                    >
                      <option value="pending">待确认</option>
                      <option value="confirmed">已确认</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="text-[var(--rose)] hover:text-red-800 font-medium text-sm"
                    >
                      删除
                    </button>
                    <button className="text-[var(--primary-dark)] hover:text-blue-800 font-medium text-sm">编辑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 text-[var(--foreground-muted)]">
          暂无预约记录，点击上方表单添加第一条预约。
        </div>
      )}

      <div className="mt-6 text-[var(--foreground-muted)] text-sm flex items-center justify-between">
        <div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> 数据实时保存至云端数据库 · <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> 支持多端同步 · <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> 实时更新
        </div>
        <div>
          <button
            onClick={() => window.location.reload()}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}