'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { RoleProvider, useRole } from '@/components/RoleProvider';

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

interface Product { id: string; name: string; price: number; originalPrice?: number; imageColor: string; imageUrl?: string; description?: string; stock?: number; }
interface Service { id: string; name: string; description?: string; price: number; duration?: number; }
interface Appointment { id: string; appointmentDate?: string; start_time?: string; status: string; customer_name?: string; }
interface Order { id: string; status: string; total?: number; created_at?: string; customerName?: string; }

const ROLE_THEMES: Record<UserRole, { hero: string; sub: string; btn1: { label: string; href: string; emoji: string }; btn2: { label: string; href: string; emoji: string }; badge: string; badgeColor: string }> = {
  guest: {
    hero: '欢迎来到丽姿秀', sub: '专业美容服务 · 精选护肤产品 · 让美丽触手可及',
    btn1: { label: '立即预约', href: '/appointments', emoji: '📅' },
    btn2: { label: '选购商品', href: '/products', emoji: '🛍️' },
    badge: '👤 访客模式', badgeColor: 'from-gray-400 to-gray-500',
  },
  customer: {
    hero: '欢迎回来，尊贵的客户', sub: '专业美容服务 · 精选护肤产品 · 专属会员权益',
    btn1: { label: '我的预约', href: '/appointments', emoji: '📅' },
    btn2: { label: '产品商城', href: '/products', emoji: '🛍️' },
    badge: '👩‍🦰 客户模式', badgeColor: 'from-pink-400 to-rose-500',
  },
  merchant: {
    hero: '商家管理后台', sub: '实时掌控业务数据 · 高效管理预约与订单',
    btn1: { label: '管理仪表盘', href: '/admin/dashboard', emoji: '📊' },
    btn2: { label: '查看日历', href: '/calendar', emoji: '📅' },
    badge: '🏪 商家模式', badgeColor: 'from-purple-500 to-indigo-600',
  },
  admin: {
    hero: '系统管理后台', sub: '全店数据一览 · 高效运营管理',
    btn1: { label: '数据面板', href: '/admin/dashboard', emoji: '📈' },
    btn2: { label: '全部订单', href: '/admin/orders', emoji: '📦' },
    badge: '👑 管理员模式', badgeColor: 'from-amber-400 to-orange-500',
  },
};

function HomeContent() {
  const { role } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()).catch(() => ({})),
      fetch('/api/services').then(r => r.json()).catch(() => ({})),
      fetch('/api/appointments').then(r => r.json()).catch(() => ({})),
      fetch('/api/orders').then(r => r.json()).catch(() => ({})),
    ]).then(([prod, svc, apt, ord]) => {
      setProducts((prod.products || []).slice(0, 4));
      setServices((svc.services || []).slice(0, 4));
      setAppointments(apt.appointments || []);
      setOrders(ord.orders || []);
      setCustomers((prod.products || []).length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const theme = ROLE_THEMES[role];
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  // 商家/管理员统计
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a: Appointment) =>
    (a.appointmentDate === today || a.start_time?.startsWith(today)) && ['pending', 'confirmed'].includes(a.status)
  );
  const pendingOrders = orders.filter((o: Order) => ['pending', 'processing'].includes(o.status));
  const totalRevenue = (orders as any[]).reduce((s: number, o: any) =>
    s + (['paid', 'delivered', 'completed'].includes(o.status) ? (o.total || 0) : 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* 角色标签 */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${theme.badgeColor} text-white text-xs font-bold rounded-full`}>
          {theme.badge}
        </span>
        <span className="text-xs text-gray-400">← 右上角可切换角色</span>
      </div>

      {/* 角色专属 Hero */}
      <div className={`bg-gradient-to-br rounded-3xl p-10 mb-10 text-white relative overflow-hidden
        ${role === 'merchant' || role === 'admin'
          ? 'from-purple-600 via-indigo-700 to-blue-800'
          : 'from-pink-500 via-purple-500 to-indigo-600'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{theme.hero}</h1>
          <p className="text-white/80 text-lg mb-8">{theme.sub}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={theme.btn1.href}
              className="px-8 py-3 bg-white text-pink-600 font-bold rounded-xl hover:bg-white/90 transition flex items-center gap-2">
              {theme.btn1.emoji} {theme.btn1.label}
            </Link>
            <Link href={theme.btn2.href}
              className="px-8 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition flex items-center gap-2">
              {theme.btn2.emoji} {theme.btn2.label}
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          商家 & 管理员视图：数据仪表盘
      ═══════════════════════════════════ */}
      {(role === 'merchant' || role === 'admin') && !loading && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { emoji: '💰', label: '总收入', value: fmt(totalRevenue), color: 'text-purple-600', bg: 'from-purple-50 to-violet-50' },
              { emoji: '📆', label: '今日预约', value: todayAppointments.length + '个', color: 'text-blue-600', bg: 'from-blue-50 to-cyan-50' },
              { emoji: '📦', label: '待处理订单', value: pendingOrders.length + '单', color: 'text-orange-600', bg: 'from-orange-50 to-amber-50' },
              { emoji: '👥', label: '客户总数', value: customers + '位', color: 'text-green-600', bg: 'from-green-50 to-emerald-50' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 border border-gray-200`}>
                <div className="text-2xl mb-2">{stat.emoji}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 商家专属快捷操作 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 商家快捷操作</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/dashboard" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition">
                <span className="text-3xl">📊</span><span className="text-sm font-medium text-gray-800">数据面板</span>
              </Link>
              <Link href="/calendar" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                <span className="text-3xl">📅</span><span className="text-sm font-medium text-gray-800">日历视图</span>
              </Link>
              <Link href="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition">
                <span className="text-3xl">📦</span><span className="text-sm font-medium text-gray-800">处理订单</span>
              </Link>
              <Link href="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition">
                <span className="text-3xl">📦</span><span className="text-sm font-medium text-gray-800">管理产品</span>
              </Link>
              <Link href="/admin/payment" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition">
                <span className="text-3xl">💳</span><span className="text-sm font-medium text-gray-800">收款码</span>
              </Link>
            </div>
          </div>

          {/* 待处理事项 */}
          {(pendingOrders.length > 0 || todayAppointments.length > 0) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ 待处理事项</h2>
              <div className="space-y-2">
                {todayAppointments.slice(0, 3).map((a: Appointment, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📆</span>
                      <div><div className="font-medium text-gray-900">{a.customer_name || '客户'}</div><div className="text-xs text-gray-500">{a.start_time}</div></div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.status === 'confirmed' ? '已确认' : '待确认'}
                    </span>
                  </div>
                ))}
                {pendingOrders.slice(0, 3).map((o: Order, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📦</span>
                      <div><div className="font-medium text-gray-900">订单 {o.id?.substring(0,8)}</div><div className="text-xs text-gray-500">{o.customerName}</div></div>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">待处理</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════
          访客 & 客户视图：消费者导向
      ═══════════════════════════════════ */}
      {(role === 'guest' || role === 'customer') && (
        <>
          {/* 快速入口 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { href: '/appointments', emoji: '📅', label: '预约服务', desc: '在线预约美容项目', color: 'from-pink-50 to-rose-50 border-pink-200' },
              { href: '/products', emoji: '🛍️', label: '产品商城', desc: '精选护肤好物', color: 'from-purple-50 to-violet-50 border-purple-200' },
              { href: '/services', emoji: '💅', label: '服务项目', desc: '查看全部服务', color: 'from-blue-50 to-cyan-50 border-blue-200' },
              { href: '/staff', emoji: '👩‍💼', label: '我们的团队', desc: '专业美容师团队', color: 'from-green-50 to-emerald-50 border-green-200' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`bg-gradient-to-br ${item.color} border rounded-2xl p-6 hover:shadow-lg transition group`}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <div className="font-bold text-gray-900 group-hover:text-pink-600 transition">{item.label}</div>
                <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧边栏 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 今日概览 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 {role === 'customer' ? '我的' : '今日'}概览</h2>
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>)}</div>
            ) : (
              <div className="space-y-4">
                {(role === 'merchant' || role === 'admin') ? (
                  <>
                    <div className="flex justify-between items-center"><span className="text-gray-600">今日预约</span><span className="font-bold text-blue-600 text-lg">{todayAppointments.length}个</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">待处理订单</span><span className="font-bold text-orange-600 text-lg">{pendingOrders.length}单</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">总收入</span><span className="font-bold text-purple-600 text-lg">{fmt(totalRevenue)}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center"><span className="text-gray-600">热门服务</span><span className="font-bold text-pink-600 text-lg">{services.length}项</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">精选商品</span><span className="font-bold text-purple-600 text-lg">{products.length}款</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">美容师</span><span className="font-bold text-green-600 text-lg">多位</span></div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 热门服务 */}
          {!loading && services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">💅 热门服务</h2>
                <Link href="/services" className="text-pink-600 text-sm hover:underline">查看全部 →</Link>
              </div>
              <div className="space-y-3">
                {services.map((s: Service) => (
                  <div key={s.id} className="flex justify-between items-center p-3 bg-pink-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.duration || 60}分钟</div>
                    </div>
                    <div className="text-pink-600 font-bold text-sm">{fmt(s.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 热门商品 */}
          {!loading && products.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">🌟 热门商品</h3>
                <Link href="/products" className="text-pink-600 font-medium text-sm hover:underline">查看全部 →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p: Product) => (
                  <Link key={p.id} href="/products" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition">
                    <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${p.imageColor} mb-3 flex items-center justify-center`}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">✨</span>}
                    </div>
                    <div className="font-medium text-gray-900 text-sm mb-1 truncate">{p.name}</div>
                    <div className="font-bold text-pink-600">{fmt(p.price)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 加载骨架 */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🌟 热门商品</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>)}
              </div>
            </div>
          )}

          {/* 使用提示 */}
          <div className={`rounded-2xl shadow-lg p-6 ${role === 'customer' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 {role === 'customer' ? '会员' : '使用'}提示</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {role === 'customer' ? (
                <>
                  <li>• 点击「立即预约」快速预约美容服务，系统自动检测时间冲突</li>
                  <li>• 在「产品商城」选购心仪商品，满500元免运费</li>
                  <li>• 联系客服获取专属会员折扣：138-8888-8888</li>
                </>
              ) : (
                <>
                  <li>• 点击右上角「🏪 商家」角色，可切换到管理后台视图</li>
                  <li>• 选择服务 → 选择时间 → 完成预约，全程不到1分钟</li>
                  <li>• 精选护肤产品，品质保证，7天无忧退换</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <RoleProvider>
      <HomeContent />
    </RoleProvider>
  );
}
