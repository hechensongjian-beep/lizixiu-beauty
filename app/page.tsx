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

  const categories = [
    {
      name: '面部护理',
      desc: '深层清洁 · 补水保湿 · 抗衰修护',
      href: '/services?cat=face',
      accent: '#c9a87c',
    },
    {
      name: '身体护理',
      desc: '全身SPA · 瘦身塑形 · 去角质',
      href: '/services?cat=body',
      accent: '#b8956a',
    },
    {
      name: '特殊护理',
      desc: '婚纱护理 · 婚前急救 · 特殊疗程',
      href: '/services?cat=special',
      accent: '#a07d5a',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* 顶部导航间距 */}
      <div className="h-16" />

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-6 pb-32">

        {/* 品牌区 */}
        <section className="text-center pt-16 pb-20">
          <p className="text-xs tracking-[0.4em] text-[var(--primary)] uppercase mb-5">LIZIXIU</p>
          <h1
            className="text-5xl md:text-6xl font-light text-[var(--foreground)] mb-6 leading-none tracking-wide"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            肌肤自然发光
          </h1>
          <p className="text-[var(--foreground-muted)] text-base max-w-md mx-auto leading-relaxed mb-12">
            东方草本智慧 · 现代美容科技 · 专属定制方案
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/appointments"
              className="px-8 py-3.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              立即预约
            </Link>
            <Link
              href="/services"
              className="px-8 py-3.5 rounded-full border border-[var(--primary)] text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)] hover:text-white transition-all"
            >
              了解服务
            </Link>
          </div>
        </section>

        {/* 服务分类 */}
        <section className="pb-20">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] text-[var(--primary)] uppercase mb-2">Services</p>
            <h2 className="text-3xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>服务项目</h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group block bg-white rounded-2xl border border-[var(--primary-light)] p-7 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* 装饰圆 */}
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: `${cat.accent}20` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: cat.accent }}
                  />
                </div>
                <h3 className="text-base font-medium text-[var(--foreground)] mb-2">{cat.name}</h3>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 数据展示 */}
        <section className="pb-20">
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '100%', label: '天然成分' },
              { num: '5年+', label: '行业经验' },
              { num: '500+', label: '忠实会员' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-[var(--primary-light)] p-6 text-center"
              >
                <div
                  className="text-3xl font-light text-[var(--primary)] mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.num}
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 精选服务 */}
        {services.length > 0 && (
          <section className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>精选服务</h2>
              <Link href="/services" className="text-xs text-[var(--primary)] hover:underline">全部 →</Link>
            </div>
            <div className="space-y-3">
              {services.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services?id=${svc.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-[var(--primary-light)] px-5 py-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg, #c9a87c, #e8d5b8)' }}
                    >
                      {svc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {svc.name}
                      </div>
                      {svc.duration && (
                        <div className="text-xs text-[var(--foreground-muted)]">{svc.duration} 分钟</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--primary)]">{fmt(svc.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 精选商品 */}
        {products.length > 0 && (
          <section className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>精选产品</h2>
              <Link href="/products" className="text-xs text-[var(--primary)] hover:underline">全部 →</Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products?id=${product.id}`}
                  className="group bg-white rounded-2xl border border-[var(--primary-light)] overflow-hidden hover:shadow-lg transition-all"
                >
                  <div
                    className="w-full aspect-square flex items-center justify-center text-white text-4xl font-bold"
                    style={{ background: product.imageUrl ? `url(${product.imageUrl}) center/cover` : 'linear-gradient(135deg, #c9a87c, #e8d5b8)', fontFamily: "'Noto Serif SC',serif" }}
                  >
                    {!product.imageUrl && (
                      <div className="text-center">
                        <div className="text-white text-4xl font-bold opacity-80">{product.name.charAt(0)}</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight mb-1">
                      {product.name}
                    </div>
                    <div className="text-xs font-semibold text-[var(--primary)]">{fmt(product.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 商家快捷入口 */}
        {isMerchant && (
          <section className="pb-16">
            <div className="bg-white rounded-2xl border border-[var(--primary)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--primary)] uppercase tracking-wider mb-1">Merchant</p>
                  <h2 className="text-lg font-medium text-[var(--foreground)]">商家后台</h2>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="px-5 py-2 rounded-full bg-[var(--primary)] text-white text-xs font-medium hover:shadow-md transition-all"
                >
                  进入
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '数据面板', href: '/admin/dashboard' },
                  { label: '订单管理', href: '/admin/orders' },
                  { label: '排班日历', href: '/admin/schedule' },
                  { label: '收款设置', href: '/admin/payment' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-center py-2 px-2 rounded-lg bg-[var(--primary-light)] text-[var(--foreground-muted)] text-xs hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 底部固定预约栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--primary-light)]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--foreground-muted)]">丽姿秀美容</p>
            <p className="text-sm text-[var(--foreground)] font-medium">开启您的专属护理</p>
          </div>
          <Link
            href="/appointments"
            className="px-7 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:shadow-md transition-all"
          >
            立即预约
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
