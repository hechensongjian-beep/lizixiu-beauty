'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  customer_name: string;
  service_type: string;
  appointment_time: string;
  status: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  membership_level: string;
  total_appointments: number;
  upcoming_appointments: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '张美琳',
    email: 'meilin@example.com',
    phone: '138****1234',
    membership_level: '钻石会员',
    total_appointments: 12,
    upcoming_appointments: 2,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('加载失败');
      const result = await response.json();
      // 只显示当前用户的预约（模拟）
      setAppointments(result.appointments.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDateTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl mb-6">
          <div className="text-3xl">👤</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">个人中心</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          查看您的个人信息、预约记录、账户设置与偏好。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* 个人信息卡片 */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">个人信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <div className="text-lg font-semibold text-gray-900">{profile.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <div className="text-lg font-semibold text-gray-900">{profile.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <div className="text-lg font-semibold text-gray-900">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会员等级</label>
                <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full">
                  {profile.membership_level}
                </span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-cyan-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">账户统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm text-center">
                  <div className="text-3xl font-bold text-gray-900">{profile.total_appointments}</div>
                  <div className="text-sm text-gray-600">历史预约</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm text-center">
                  <div className="text-3xl font-bold text-gray-900">{profile.upcoming_appointments}</div>
                  <div className="text-sm text-gray-600">待服务</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm text-center">
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">完成率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 最近预约 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">最近预约</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">加载预约记录中...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无预约记录</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">客户姓名</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">服务项目</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">预约时间</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900">{apt.customer_name}</td>
                        <td className="py-4 px-6 text-gray-700">{apt.service_type}</td>
                        <td className="py-4 px-6 text-gray-700">{formatDateTime(apt.appointment_time)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {apt.status === 'completed' ? '已完成' : apt.status === 'pending' ? '待服务' : '已取消'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-8 text-center">
              <Link
                href="/calendar"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                查看完整日历 →
              </Link>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-4">
              <button
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition text-left flex items-center"
                onClick={() => alert('预约新服务')}
              >
                <span className="text-xl mr-3">📅</span>
                <span>预约新服务</span>
              </button>
              <button
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition text-left flex items-center"
                onClick={() => alert('修改个人信息')}
              >
                <span className="text-xl mr-3">✏️</span>
                <span>修改个人信息</span>
              </button>
              <button
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition text-left flex items-center"
                onClick={() => alert('更改密码')}
              >
                <span className="text-xl mr-3">🔒</span>
                <span>更改密码</span>
              </button>
              <button
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition text-left flex items-center"
                onClick={() => alert('联系客服')}
              >
                <span className="text-xl mr-3">💬</span>
                <span>联系客服</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">会员特权</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="text-green-600 mr-3">✓</div>
                <span className="text-gray-700">专属折扣（最高 8.5 折）</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">✓</div>
                <span className="text-gray-700">优先预约热门时段</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">✓</div>
                <span className="text-gray-700">生日月免费护理一次</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">✓</div>
                <span className="text-gray-700">专属客服经理</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">✓</div>
                <span className="text-gray-700">新品体验优先资格</span>
              </li>
            </ul>
            <div className="mt-6 text-center">
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
                onClick={() => alert('升级会员')}
              >
                升级会员等级
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">系统通知</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-amber-300">
                <div className="text-sm text-amber-700 font-medium mb-1">📢 系统维护</div>
                <p className="text-sm text-gray-700">4月10日凌晨2:00‑5:00系统维护，期间暂停预约功能。</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-amber-300">
                <div className="text-sm text-amber-700 font-medium mb-1">🎉 节日活动</div>
                <p className="text-sm text-gray-700">五一劳动节期间，所有服务项目享9折优惠！</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回仪表板
        </Link>
      </div>
    </div>
  );
}