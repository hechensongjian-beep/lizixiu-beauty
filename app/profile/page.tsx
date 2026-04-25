'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAppointments } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  service_name?: string;
  staff_name?: string;
  customer_name: string;
  status: string;
  notes?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待确认', confirmed: '已确认',
  completed: '已完成', cancelled: '已取消',
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-[#c9a87c] text-white',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function ProfilePage() {
  const { role, user, signOut } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'appointments'>('info');

  
    useEffect(() => { document.title = '个人中心 - 丽姿秀';
    getAppointments()
      .then(result => setAppointments(result?.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;

  const LEVEL_COLORS: Record<string, string> = {
    '普通会员': 'bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8]',
    '钻石会员': 'bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8]',
    '金卡会员': 'bg-gradient-to-r from-[#d4a853] to-[#f5d98a]',
    '银卡会员': 'bg-gradient-to-r from-[#c0c0c0] to-[#e8e8e8]',
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getRoleLabel = () => {
    if (role === 'customer') return '会员';
    if (role === 'merchant') return '商家';
    if (role === 'admin') return '管理员';
    if (role === 'staff') return '员工';
    return '访客';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 className="text-2xl" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>个人中心</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>管理您的预约与账户信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{totalCount}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>历史预约</div>
        </div>
        <div className="bg-white rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div className="text-2xl font-bold text-amber-600">{upcomingCount}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>待服务</div>
        </div>
        <div className="bg-white rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>已完成</div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b mb-6" style={{ borderColor: 'var(--primary-light)' }}>
        {(['info', 'appointments'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-6 py-3 text-sm font-medium border-b-2 transition-all"
            style={tab === key
              ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
              : { borderColor: 'transparent', color: 'var(--foreground-muted)' }}
          >
            {key === 'info' ? '个人信息' : '预约记录'}
          </button>
        ))}
      </div>

      {/* 个人信息 */}
      {tab === 'info' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--primary-light)' }}>
            <h2 className="text-base font-medium mb-5" style={{ color: 'var(--foreground)' }}>账户信息</h2>
            {[
              { label: '当前角色', value: getRoleLabel() },
              { label: '登录状态', value: role ? '已登录' : '未登录' },
              { label: '会员等级', value: '普通会员', tag: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(201,168,124,0.15)' }}>
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item.label}</span>
                {item.tag ? (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${LEVEL_COLORS[item.value]}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* 会员特权 */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--primary-light)' }}>
            <h2 className="text-base font-medium mb-4" style={{ color: 'var(--foreground)' }}>会员特权</h2>
            <div className="space-y-3">
              {[
                '专属折扣（最高 8.5 折）',
                '优先预约热门时段',
                '会员生日特惠',
                '积分兑换好礼',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Link href="/appointments"
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center transition hover:opacity-90"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)' }}>
                立即预约
              </Link>
              <Link href="/products"
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition"
                style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }}>
                浏览产品
              </Link>
            </div>
          </div>

          {/* 退出登录 */}
          {user && (
            <button onClick={handleSignOut}
              className="w-full py-3 rounded-xl border-2 font-semibold text-sm transition hover:bg-red-50 hover:border-red-300"
              style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
              退出登录
            </button>
          )}
        </div>
      )}

      {/* 预约记录 */}
      {tab === 'appointments' && (
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid var(--primary-light)' }}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-lg mb-2">暂无预约记录</p>
              <p className="text-sm mb-6">快去预约一次服务吧</p>
              <Link href="/appointments"
                className="inline-block px-8 py-3 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)' }}>
                去预约
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--primary-light)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        {apt.service_name || apt.notes?.split('|')[0]?.replace('项目:', '') || '美容服务'}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        {apt.start_time ? apt.start_time.replace('T', ' ').slice(0, 16) : apt.appointment_date}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLE[apt.status] || 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABEL[apt.status] || apt.status}
                    </span>
                  </div>
                  {apt.staff_name && (
                    <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      美容师：{apt.staff_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
