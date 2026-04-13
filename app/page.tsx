'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleProvider';
import { getProducts, getServices, getAppointments, getOrders } from '@/lib/api';

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

interface Product { id: string; name: string; price: number; originalPrice?: number; imageColor: string; imageUrl?: string; description?: string; stock?: number; }
interface Service { id: string; name: string; description?: string; price: number; duration?: number; }
interface Appointment { id: string; appointmentDate?: string; start_time?: string; status: string; customer_name?: string; }
interface Order { id: string; status: string; total?: number; created_at?: string; customerName?: string; }

const ROLE_CONFIG: Record<UserRole, { 
  hero: string; 
  sub: string; 
  actions: { label: string; href: string; primary?: boolean }[];
}> = {
  guest: {
    hero: '欢迎来到丽姿秀',
    sub: '专业美容服务 · 精选护肤产品 · 让美丽触手可及',
    actions: [
      { label: '立即预约', href: '/appointments', primary: true },
      { label: '选购商品', href: '/products' },
    ],
  },
  customer: {
    hero: '欢迎回来',
    sub: '专业美容服务 · 精选护肤产品 · 专属会员权益',
    actions: [
      { label: '我的预约', href: '/appointments', primary: true },
      { label: '产品商城', href: '/products' },
    ],
  },
  merchant: {
    hero: '商家管理后台',
    sub: '实时掌控业务数据 · 高效管理预约与订单',
    actions: [
      { label: '管理仪表盘', href: '/admin/dashboard', primary: true },
      { label: '查看日历', href: '/calendar' },
    ],
  },
  admin: {
    hero: '系统管理后台',
    sub: '全店数据一览 · 高效运营管理',
    actions: [
      { label: '数据面板', href: '/admin/dashboard', primary: true },
      { label: '全部订单', href: '/admin/orders' },
    ],
  },
};

function HomeContent() {
  const { role } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getServices(),
      getAppointments(),
      getOrders(),
    ]).then(([prod, svc, apt, ord]) => {
      setProducts((prod?.products || []).slice(0, 4));
      setServices((svc?.services || []).slice(0, 4));
      setAppointments(apt?.appointments || []);
      setOrders(ord?.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const config = ROLE_CONFIG[role];
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  // 统计数据
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a: Appointment) =>
    (a.appointmentDate === today || a.start_time?.startsWith(today)) && ['pending', 'confirmed'].includes(a.status)
  );
  const pendingOrders = orders.filter((o: Order) => ['pending', 'processing'].includes(o.status));
  const totalRevenue = (orders as any[]).reduce((s: number, o: any) =>
    s + (['paid', 'delivered', 'completed'].includes(o.status) ? (o.total || 0) : 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Section - 优雅精致 */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--accent)] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10 px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide mb-3 animate-fade-in-up" 
              style={{ fontFamily: 'var(--font-serif)' }}>
            {config.hero}
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl">{config.sub}</p>
          
          <div className="flex flex-wrap gap-4">
            {config.actions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  action.primary
                    ? 'bg-white text-[var(--accent)] hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 商家/管理员数据面板 */}
      {(role === 'merchant' || role === 'admin') && !loading && (
        <section className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '总收入', value: fmt(totalRevenue), accent: true },
              { label: '今日预约', value: `${todayAppointments.length} 个` },
              { label: '待处理订单', value: `${pendingOrders.length} 单` },
              { label: '产品数量', value: `${products.length} 款` },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className={`card ${stat.accent ? 'border-[var(--primary)]' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`text-2xl font-semibold ${stat.accent ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--foreground-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 快捷操作 */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              快捷操作
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { href: '/admin/dashboard', label: '数据面板' },
                { href: '/calendar', label: '日历视图' },
                { href: '/admin/orders', label: '处理订单' },
                { href: '/admin/products', label: '管理产品' },
                { href: '/admin/payment', label: '收款设置' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--primary-light)] transition-colors text-center"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 访客/客户视图 */}
      {(role === 'guest' || role === 'customer') && (
        <>
          {/* 快速入口 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/appointments', label: '预约服务', desc: '在线预约美容项目' },
              { href: '/products', label: '产品商城', desc: '精选护肤好物' },
              { href: '/services', label: '服务项目', desc: '查看全部服务' },
              { href: '/staff', label: '专业团队', desc: '美容师团队' },
            ].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="card group cursor-pointer"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-base font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {item.label}
                </div>
                <div className="text-sm text-[var(--foreground-muted)] mt-1">{item.desc}</div>
              </Link>
            ))}
          </section>

          {/* 热门服务 */}
          {services.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                  热门服务
                </h2>
                <Link href="/services" className="text-sm text-[var(--primary)] hover:underline">
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service, i) => (
                  <div key={service.id} className="card" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="font-medium text-[var(--foreground)]">{service.name}</div>
                    <div className="text-sm text-[var(--foreground-muted)] mt-1">
                      {service.duration ? `${service.duration}分钟 · ` : ''}{fmt(service.price)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 热门商品 */}
          {products.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                  热门商品
                </h2>
                <Link href="/products" className="text-sm text-[var(--primary)] hover:underline">
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, i) => (
                  <Link key={product.id} href={`/products?id=${product.id}`} className="card group">
                    <div 
                      className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center text-4xl"
                      style={{ background: product.imageUrl ? `url(${product.imageUrl}) center/cover` : product.imageColor }}
                    >
                      {!product.imageUrl && product.name.charAt(0)}
                    </div>
                    <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {product.name}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-[var(--primary)] font-semibold">{fmt(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-[var(--foreground-muted)] line-through">{fmt(product.originalPrice)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 使用提示 */}
          <section className="card bg-[var(--background-secondary)]">
            <h3 className="text-base font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
              温馨提示
            </h3>
            <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
              <li>• 点击「立即预约」快速预约美容服务，系统自动检测时间冲突</li>
              <li>• 在「产品商城」选购心仪商品，满500元免运费</li>
              <li>• 联系客服获取专属会员折扣：138-8888-8888</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <HomeContent />
  );
}
