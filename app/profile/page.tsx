'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAppointments, getOrders } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

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

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待确认', confirmed: '已确认',
  completed: '已完成', cancelled: '已取消',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待支付', paid: '已支付',
  shipped: '配送中', delivered: '已完成',
  cancelled: '已取消',
};

export default function ProfilePage() {
  const { role, user, signOut } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<{ id: string; name: string; timestamp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'appointments' | 'orders' | 'history'>('info');

  // 用户信息
  const [userInfo, setUserInfo] = useState({
    email: '',
    phone: '',
    createdAt: '',
  });

  useEffect(() => {
    document.title = '个人中心 - 丽姿秀';

    Promise.all([
      getAppointments(),
      getOrders(),
    ]).then(([aptData, orderData]) => {
      setAppointments(aptData?.appointments || []);
      setOrders(orderData?.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));

    // 读取浏览记录
    try {
      const history = JSON.parse(localStorage.getItem('beauty-browsing-history') || '[]');
      setBrowsingHistory(history.slice(0, 10)); // 最近10条
    } catch {}

    // 获取用户信息
    if (user) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUserInfo({
            email: data.user.email || '',
            phone: data.user.user_metadata?.phone || '未设置',
            createdAt: new Date(data.user.created_at || '').toLocaleDateString('zh-CN'),
          });
        }
      });
    }
  }, [user]);

  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;

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

  const clearHistory = () => {
    localStorage.removeItem('beauty-browsing-history');
    setBrowsingHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '2rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>个人中心</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1rem' }}>管理您的预约、订单与账户信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>{totalCount}</div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>历史预约</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{upcomingCount}</div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>待服务</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--primary-light)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--sage)' }}>{completedCount}</div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>已完成</div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b mb-6 overflow-x-auto" style={{ borderColor: 'var(--primary-light)' }}>
        {(['info', 'appointments', 'orders', 'history'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
            style={tab === key
              ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
              : { borderColor: 'transparent', color: 'var(--foreground-muted)' }}
          >
            {key === 'info' ? '个人信息' : key === 'appointments' ? '预约记录' : key === 'orders' ? '历史订单' : '浏览记录'}
          </button>
        ))}
      </div>

      {/* 个人信息 */}
      {tab === 'info' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--primary-light)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1.25rem', color: 'var(--foreground)' }}>账户信息</h2>
            {[
              { label: '当前角色', value: getRoleLabel() },
              { label: '登录邮箱', value: userInfo.email || '未设置' },
              { label: '手机号码', value: userInfo.phone },
              { label: '注册时间', value: userInfo.createdAt || '未知' },
              { label: '会员等级', value: '普通会员', tag: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(201,168,124,0.15)' }}>
                <span style={{ fontSize: '1rem', color: 'var(--foreground-muted)' }}>{item.label}</span>
                {item.tag ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                    {item.value}
                  </span>
                ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--foreground)' }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* 会员特权 */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--primary-light)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--foreground)' }}>会员特权</h2>
            <div className="space-y-3">
              {[
                '专属折扣（最高 8.5 折）',
                '优先预约热门时段',
                '会员生日特惠',
                '积分兑换好礼',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: '1rem', color: 'var(--foreground-muted)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Link href="/appointments"
                className="block w-full py-3 rounded-xl text-white text-center font-medium transition hover:opacity-90"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(45,74,62,0.3)' }}>
                立即预约
              </Link>
            </div>
          </div>

          {/* 退出登录 */}
          {user && (
            <button onClick={handleSignOut}
              className="w-full py-3 rounded-xl border-2 font-medium transition" style={{ color: 'var(--rose)', borderColor: 'rgba(177,93,94,0.3)', fontSize: '1rem' }}>
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
                <div className="h-4 rounded w-1/3 mb-2"></div>
                <div className="h-3 rounded w-1/2"></div>
              </div>)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>暂无预约记录</p>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>快去预约一次服务吧</p>
              <Link href="/appointments"
                className="inline-block px-8 py-3 rounded-xl text-white font-medium"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(45,74,62,0.3)' }}>
                去预约
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--primary-light)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem', fontSize: '1rem', color: 'var(--foreground)' }}>
                        {apt.service_name || apt.notes?.split('|')[0]?.replace('项目:', '') || '美容服务'}
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)' }}>
                        {apt.start_time ? apt.start_time.replace('T', ' ').slice(0, 16) : apt.appointment_date}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: apt.status === 'completed' ? 'rgba(156,175,136,0.15)' : apt.status === 'confirmed' ? 'var(--primary)' : 'rgba(201,168,124,0.15)', color: apt.status === 'completed' ? 'var(--sage)' : apt.status === 'confirmed' ? 'white' : 'var(--primary-dark)' }}>
                      {STATUS_LABEL[apt.status] || apt.status}
                    </span>
                  </div>
                  {apt.staff_name && (
                    <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)' }}>
                      美容师：{apt.staff_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 历史订单 */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>暂无订单记录</p>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>快去选购心仪的产品吧</p>
              <Link href="/products"
                className="inline-block px-8 py-3 rounded-xl text-white font-medium"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(45,74,62,0.3)' }}>
                去购物
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--primary-light)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem', fontSize: '1rem', color: 'var(--foreground)' }}>
                        订单 #{order.id.slice(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: order.status === 'delivered' ? 'rgba(156,175,136,0.15)' : order.status === 'paid' ? 'var(--primary)' : 'rgba(201,168,124,0.15)', color: order.status === 'delivered' ? 'var(--sage)' : order.status === 'paid' ? 'white' : 'var(--primary-dark)' }}>
                      {ORDER_STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                    {order.items.slice(0, 2).map(i => i.name).join('、')}{order.items.length > 2 && ` 等${order.items.length}件商品`}
                  </div>
                  <div style={{ fontWeight: 500, color: 'var(--primary-dark)', fontSize: '1rem' }}>
                    ¥{order.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 浏览记录 */}
      {tab === 'history' && (
        <div>
          {browsingHistory.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>暂无浏览记录</p>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>浏览过的产品会显示在这里</p>
              <Link href="/products"
                className="inline-block px-8 py-3 rounded-xl text-white font-medium"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(45,74,62,0.3)' }}>
                浏览产品
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={clearHistory} className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  清除记录
                </button>
              </div>
              <div className="space-y-3">
                {browsingHistory.map(item => (
                  <Link key={item.id} href={`/product?id=${item.id}`}
                    className="block bg-white rounded-xl p-4 border transition hover:shadow-md"
                    style={{ borderColor: 'var(--primary-light)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--foreground)', fontSize: '1rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                      {new Date(item.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
