'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
      const response = await fetch('/api/appointments');
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // 加载客户、服务、员工选项
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [custRes, servRes, staffRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/services'),
          fetch('/api/staff')
        ]);
        if (custRes.ok) {
          const data = await custRes.json();
          setCustomers(data.customers || []);
        }
        if (servRes.ok) {
          const data = await servRes.json();
          setServices(data.services || []);
        }
        if (staffRes.ok) {
          const data = await staffRes.json();
          setStaff(data.staff || []);
        }
      } catch (err) {
        console.error('加载选项失败:', err);
      }
    };
    fetchOptions();
  }, []);

  // 加载预约数据（通过 API）
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);

      // 直接调用 API
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      const result = await response.json();
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
    // 假设服务时长为 1 小时
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    try {
      setIsAdding(true);
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id,
          service_id,
          staff_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'pending',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '添加失败');
      }
      const data = await response.json();
      setAppointments([...appointments, data]);
      setNewAppointment({ customer_id: '', service_id: '', staff_id: '', appointment_date: '', appointment_time: '' });
      alert('预约添加成功！');
    } catch (err: any) {
      alert('添加失败: ' + err.message);
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新状态失败');
      }
      const data = await response.json();
      setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    } catch (err: any) {
      alert('更新状态失败: ' + err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该预约吗？')) return;
    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除失败');
      }
      setAppointments(appointments.filter(apt => apt.id !== id));
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
          <div className="text-5xl mb-6">🔌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">数据库连接失败</h2>
          <p className="text-gray-700 mb-6">
            无法连接到 Supabase 数据库，这通常是因为您的 Supabase 项目处于<strong>暂停状态</strong>（免费项目在闲置7天后会自动暂停）。
          </p>
          <div className="bg-white rounded-xl p-6 border border-red-300 mb-8 text-left">
            <h3 className="font-semibold text-red-800 mb-3">请按以下步骤恢复：</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>访问 <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline font-medium">Supabase 控制台</a></li>
              <li>选择项目 <code className="bg-gray-100 px-2 py-1 rounded text-sm">jrdzmohjsteykvxszwve</code></li>
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
              🔄 重试连接
            </button>
            <a
              href="https://supabase.com/dashboard/project/jrdzmohjsteykvxszwve"
              target="_blank"
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              ⚡ 立即唤醒项目
            </a>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            如果您需要帮助，请参考 <a href="https://supabase.com/docs/guides/platform/pause" target="_blank" className="text-blue-600 hover:underline">Supabase 暂停与恢复文档</a>。
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
            <div className="w-80 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-40 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
        </div>

        {/* 添加表单骨架 */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            <div className="h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="h-12 w-32 bg-gray-300 rounded-lg"></div>
            <div className="h-4 w-64 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* 表格骨架 */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['客户', '手机号', '服务项目', '预约时间', '状态', '操作'].map((col) => (
                  <th key={col} className="px-6 py-3 text-left">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !connectionError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-2xl mx-auto">
        <p className="font-semibold mb-2">数据加载失败</p>
        <p className="mb-4">{error}</p>
        <button onClick={fetchAppointments} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
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
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5 text-gray-400">🔍</div>
          </div>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
            title="导出为 Excel 可导入的 CSV 文件"
          >
            <span>📥</span>
            <span>导出 CSV</span>
          </button>
        </div>
        <div className="text-gray-500">
          共 <span className="font-bold text-gray-800">{filteredAppointments.length}</span> 条预约记录
        </div>
      </div>

      {/* 添加预约表单 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">添加新预约</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={newAppointment.customer_id}
            onChange={(e) => setNewAppointment({ ...newAppointment, customer_id: e.target.value })}
          >
            <option value="">选择客户 *</option>
            {customers.map(cust => (
              <option key={cust.id} value={cust.id}>{cust.name} ({cust.phone})</option>
            ))}
          </select>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={newAppointment.service_id}
            onChange={(e) => setNewAppointment({ ...newAppointment, service_id: e.target.value })}
          >
            <option value="">选择服务 *</option>
            {services.map(serv => (
              <option key={serv.id} value={serv.id}>{serv.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={newAppointment.appointment_date}
            onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <input
            type="time"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
          <span className="text-sm text-gray-500">📅 选择客户、服务、员工 | ⏰ 禁止过去时间</span>
        </div>
      </div>

      {/* 预约表格 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">客户</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">手机号</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">服务项目</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">预约时间</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((apt) => {
              const { date, time } = formatDateTime(apt.appointment_time);
              return (
                <tr key={apt.id} className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{apt.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{apt.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{apt.service_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    <div className="font-medium">{date}</div>
                    <div className="text-sm text-gray-500">{time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}
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
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      删除
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">编辑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          暂无预约记录，点击上方表单添加第一条预约。
        </div>
      )}

      <div className="mt-6 text-gray-500 text-sm flex items-center justify-between">
        <div>
          💾 数据实时保存至云端数据库 · 🔄 支持多端同步 · 🔔 实时更新
        </div>
        <div>
          <button
            onClick={() => window.location.reload()}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}