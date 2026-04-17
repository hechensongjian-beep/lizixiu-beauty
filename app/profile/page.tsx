'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAppointments } from '@/lib/api';
import { useRole } from '@/components/RoleProvider';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  service_name?: string;
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
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function ProfilePage() {
  const { role } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'appointments'>('info');

  const fetchAppointments = async () => {
    try {
      const result = await getAppointments();
      setAppointments(result?.appointments || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;

  const LEVEL_COLORS: Record<string, string> = {
    '钻石会员': 'bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8]',
    '金卡会员': 'bg-gradient-to-r from-[#d4a853] to-[#f5d98a]',
    '银卡会员': 'bg-gradient-to-r from-[#c0c0c0] to-[#e8e8e8]',
    '普通会员': 'bg-[var(--primary-light)]',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>个人中心</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">管理您的预约与账户信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5 text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">{totalCount}</div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">历史预约</div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5 text-center">
          <div className="text-2xl font-bold text-amber-600">{upcomingCount}</div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">待服务</div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-5 text-center">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-[var(--foreground-muted)] mt-1">已完成</div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-[var(--primary-light)] mb-6">
        {([
          ['info', '个人信息'],
          ['appointments', '预约记录'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 个人信息 */}
      {tab === 'info' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-5">账户信息</h2>
            {[
              { label: '当前角色', value: role === 'customer' ? '会员' : role === 'merchant' ? '商家' : role === 'admin' ? '管理员' : role === 'staff' ? '员工' : '访客' },
              { label: '登录状态', value: role ? '已登录' : '未登录' },
              { label: '会员等级', value: '普通会员', tag: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-[var(--primary-light)] last:border-0">
                <span className="text-sm text-[var(--foreground-muted)]">{item.label}</span>
                {item.tag ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${LEVEL_COLORS[item.value] || LEVEL_COLORS['普通会员']}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* 会员特权 */}
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-4">会员特权</h2>
            <div className="space-y-3">
              {[
                '专属折扣（最高 8.5 折）',
                '优先预约热门时段',
                '生日月免费护理一次',
                '新品体验优先资格',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <span className="text-sm text-[var(--foreground)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
            <h2 className="text-base font-medium text-[var(--foreground)] mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '预约服务', href: '/appointments', icon: 'calendar' },
                { label: '我的订单', href: '/orders', icon: 'package' },
                { label: '联系客服', href: '/chat', icon: 'chat' },
                { label: '通知中心', href: '/notifications', icon: 'bell' },
              ].map(action => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--primary-light)] text-sm text-[var(--foreground)] hover:bg-[var(--primary-light)] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    {action.icon === 'calendar' && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                    {action.icon === 'package' && <><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
                    {action.icon === 'chat' && <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>}
                    {action.icon === 'bell' && <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}
                  </svg>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 预约记录 */}
      {tab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-[var(--primary-light)] p-6">
          <h2 className="text-base font-medium text-[var(--foreground)] mb-4">预约记录</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:'var(--primary-light)'}}></div>)}
            </div>
          ) : appointments.length === 0 && role === 'guest' ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background:'var(--primary-light)'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="text-[var(--foreground-muted)]">登录后查看您的预约记录</p>
              <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                <Link href="/auth/login" className="px-5 py-2 rounded-full text-white text-xs font-bold" style={{background:'linear-gradient(135deg, #c9a87c, #b8956a)'}}>
                  登录 / 注册
                </Link>
                <Link href="/appointments" className="px-5 py-2 rounded-full text-xs font-bold" style={{border:'1px solid #e8d5b8',color:'#a88a5c'}}>
                  立即预约
                </Link>
              </div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background:'var(--primary-light)'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="text-[var(--foreground-muted)]">暂无预约记录</p>
              <Link href="/appointments" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">立即预约</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between py-3 border-b border-[var(--primary-light)] last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--foreground)]">{apt.service_name || apt.customer_name || '预约服务'}</div>
                    <div className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {apt.appointment_date?.substring(0,10)} {apt.start_time?.substring(0,5)}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[apt.status] || STATUS_STYLE.pending}`}>
                    {STATUS_LABEL[apt.status] || '待确认'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)]">返回首页</Link>
      </div>
    </div>
  );
}
