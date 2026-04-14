'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleProvider';
import { getProducts, getServices } from '@/lib/api';

interface Product { id: string; name: string; price: number; originalPrice?: number; imageColor: string; imageUrl?: string; description?: string; stock?: number; }
interface Service { id: string; name: string; description?: string; price: number; duration?: number; category?: string; }

function HomeContent() {
  const { role } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getServices()]).then(([prod, svc]) => {
      setProducts((prod?.products || []).slice(0, 4));
      setServices((svc?.services || []).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  const isCustomer = role === 'customer' || role === 'guest';
  const isMerchant = role === 'merchant' || role === 'admin';

  const serviceCategories = [
    { label: '面部护理', desc: '深层清洁 · 补水保湿 · 抗衰修护', icon: '◆', href: '/services?cat=face' },
    { label: '身体护理', desc: '全身SPA · 瘦身塑形 · 去角质', icon: '◇', href: '/services?cat=body' },
    { label: '特殊护理', desc: '婚纱护理 · 婚前急救 · 特殊疗程', icon: '○', href: '/services?cat=special' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 space-y-16">
      {/* Hero */}
      <section className="text-center pt-12 pb-4">
        <p className="text-sm tracking-[0.3em] text-[var(--primary)] mb-4 uppercase">LIZIXIU BEAUTY</p>
        <h1 className="text-4xl md:text-5xl font-light text-[var(--foreground)] mb-6 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          让肌肤，<span className="text-[var(--primary)]">自然</span>发光
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          丽姿秀融合东方草本智慧与现代美容科技，为您提供专属的肌肤定制方案
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/appointments" className="px-8 py-4 rounded-full bg-[var(--primary)] text-white font-medium hover:shadow-lg hover:-translate-y-1 transition-all text-base">
            立即预约
          </Link>
          <Link href="/services" className="px-8 py-4 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] font-medium hover:bg-[var(--primary)] hover:text-white transition-all text-base">
            了解服务
          </Link>
        </div>
      </section>

      {/* 商家后台快捷入口 */}
      {isMerchant && (
        <section className="card border-l-4 border-l-[var(--primary)] bg-[var(--background-secondary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">商家后台</p>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mt-1">管理面板</h2>
            </div>
            <Link href="/admin/dashboard" className="px-6 py-3 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:shadow-md transition-all">
              进入后台
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: '数据面板', href: '/admin/dashboard' },
              { label: '处理订单', href: '/admin/orders' },
              { label: '排班日历', href: '/admin/schedule' },
              { label: '收款设置', href: '/admin/payment' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-center py-2 px-3 rounded-lg bg-white text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:shadow-sm transition-all">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 服务分类 */}
      <section>
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] text-[var(--primary)] uppercase mb-2">WHAT WE OFFER</p>
          <h2 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>服务项目</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceCategories.map((cat, i) => (
            <Link key={cat.label} href={cat.href}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[var(--primary-light)] p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">{cat.label}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{cat.desc}</p>
              <div className="mt-4 text-xs text-[var(--primary)]">查看详情 →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选服务 */}
      {services.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] text-[var(--primary)] uppercase mb-1">SERVICES</p>
              <h2 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>精选服务</h2>
            </div>
            <Link href="/services" className="text-sm text-[var(--primary)] hover:underline">全部服务</Link>
          </div>
          <div className="space-y-3">
            {services.map((svc, i) => (
              <Link key={svc.id} href={`/services?id=${svc.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-[var(--primary-light)] px-6 py-5 hover:shadow-md hover:-translate-x-1 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] text-lg">
                    {svc.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{svc.name}</div>
                    {svc.duration && <div className="text-sm text-[var(--foreground-muted)]">{svc.duration} 分钟</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--primary)] font-semibold">{fmt(svc.price)}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">立即预约</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 精选商品 */}
      {products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] text-[var(--primary)] uppercase mb-1">PRODUCTS</p>
              <h2 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>精选产品</h2>
            </div>
            <Link href="/products" className="text-sm text-[var(--primary)] hover:underline">全部产品</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products?id=${product.id}`}
                className="group bg-white rounded-2xl border border-[var(--primary-light)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div
                  className="w-full aspect-square flex items-center justify-center text-white text-3xl font-light"
                  style={{ background: product.imageUrl ? `url(${product.imageUrl}) center/cover` : product.imageColor || '#c9a87c' }}
                >
                  {!product.imageUrl && <span className="opacity-80">{product.name.charAt(0)}</span>}
                </div>
                <div className="p-4">
                  <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors text-sm leading-tight mb-2">{product.name}</div>
                  <div className="text-[var(--primary)] font-semibold">{fmt(product.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 品牌承诺 */}
      <section className="rounded-2xl bg-[var(--accent)] text-white p-10 text-center">
        <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'var(--font-serif)' }}>我们相信</h2>
        <p className="text-white/80 max-w-lg mx-auto leading-relaxed mb-6">
          每一次护理，都是一次与肌肤的深度对话。丽姿秀坚持使用高品质原料，由资深美容师为您量身定制。
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { num: '100%', label: '天然成分' },
            { num: '5年+', label: '行业经验' },
            { num: '500+', label: '忠实会员' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-light text-white/90">{item.num}</div>
              <div className="text-xs text-white/60 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 底部CTA */}
      <section className="text-center">
        <h2 className="text-2xl text-[var(--foreground)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>预约您的专属护理</h2>
        <p className="text-[var(--foreground-muted)] mb-6">全程在线预约，轻松安排您的美容时间</p>
        <Link href="/appointments"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--primary)] text-white font-medium hover:shadow-lg hover:-translate-y-1 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          立即预约
        </Link>
      </section>
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
