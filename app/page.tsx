'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleProvider';
import { getProducts, getServices } from '@/lib/api';

interface Product { id: string; name: string; price: number; imageColor: string; imageUrl?: string; }
interface Service { id: string; name: string; price: number; duration?: number; category?: string; }

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
  const isMerchant = role === 'merchant' || role === 'admin';

  return (
    <div className="min-h-screen" style={{ background: '#faf8f5', fontFamily: 'var(--font-sans)' }}>
      <div className="h-16" />

      <main className="max-w-3xl mx-auto px-8 pb-36">

        {/* 品牌区 — 极简留白 */}
        <section className="text-center pt-20 pb-24">
          <p className="text-xs tracking-[0.5em] uppercase mb-6" style={{ color: '#c9a87c' }}>LIZIXIU BEAUTY</p>
          <h1
            className="text-5xl md:text-6xl font-light leading-none mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: '#2a2a28' }}
          >
            肌肤自然发光
          </h1>
          <p className="text-base mb-10" style={{ color: '#9b9b98', maxWidth: '340px', margin: '0 auto' }}>
            东方草本 · 现代美容科技 · 专属定制
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/appointments"
              className="px-8 py-3.5 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a87c 0%, #b8956a 100%)', boxShadow: '0 4px 16px rgba(201,168,124,0.3)' }}
            >
              立即预约
            </Link>
            <Link
              href="/services"
              className="px-8 py-3.5 rounded-full text-sm font-medium transition-all"
              style={{ border: '1px solid #e8d5b8', color: '#a88a5c' }}
            >
              了解服务
            </Link>
          </div>
        </section>

        {/* 分隔线 */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #e8d5b8, transparent)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: '#c9a87c' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #e8d5b8, transparent)' }} />
        </div>

        {/* 服务分类 */}
        <section className="mb-16">
          <h2 className="text-base font-medium text-center mb-8 tracking-wide" style={{ color: '#2a2a28', fontFamily: 'var(--font-serif)' }}>
            服务项目
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: '面部护理', desc: '清洁 · 补水 · 修护', href: '/services?cat=face' },
              { name: '身体护理', desc: 'SPA · 塑形 · 去角质', href: '/services?cat=body' },
              { name: '特殊护理', desc: '婚前 · 婚纱 · 特殊', href: '/services?cat=special' },
            ].map((cat) => (
              <Link key={cat.name} href={cat.href}
                className="group bg-white rounded-2xl p-6 text-center border transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ border: '1px solid #f0ebe3' }}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a87c15, #e8d5b815)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#c9a87c' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: '#2a2a28' }}>{cat.name}</div>
                <div className="text-xs" style={{ color: '#b0b0ad' }}>{cat.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 精选服务 */}
        {services.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium" style={{ color: '#2a2a28' }}>精选服务</h2>
              <Link href="/services" className="text-xs" style={{ color: '#a88a5c' }}>全部 →</Link>
            </div>
            <div className="space-y-2">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-5 py-4 group transition hover:shadow-sm"
                  style={{ border: '1px solid #f0ebe3' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, #c9a87c, #e8d5b8)' }}>
                      {svc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: '#2a2a28' }}>{svc.name}</div>
                      {svc.duration && <div className="text-xs" style={{ color: '#b0b0ad' }}>{svc.duration} 分钟</div>}
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#a88a5c' }}>{fmt(svc.price)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 精选商品 */}
        {products.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium" style={{ color: '#2a2a28' }}>精选产品</h2>
              <Link href="/products" className="text-xs" style={{ color: '#a88a5c' }}>全部 →</Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {products.map((p) => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="bg-white rounded-xl overflow-hidden group transition hover:shadow-md"
                  style={{ border: '1px solid #f0ebe3' }}
                >
                  <div
                    className="w-full aspect-square flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : 'linear-gradient(135deg, #c9a87c, #e8d5b8)' }}
                  >
                    {!p.imageUrl && p.name.charAt(0)}
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs truncate mb-0.5" style={{ color: '#2a2a28' }}>{p.name}</div>
                    <div className="text-xs font-medium" style={{ color: '#a88a5c' }}>{fmt(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 商家后台入口 */}
        {isMerchant && (
          <section className="mb-8 rounded-2xl p-5 border" style={{ background: 'linear-gradient(135deg, #c9a87c08, #e8d5b808)', border: '1px solid #e8d5b8' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#c9a87c' }}>商家</div>
                <div className="text-sm font-medium" style={{ color: '#2a2a28' }}>进入后台管理</div>
              </div>
              <Link href="/admin/dashboard"
                className="px-5 py-2 rounded-full text-xs font-medium text-white transition hover:opacity-90"
                style={{ background: '#a88a5c' }}
              >
                进入
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* 灵动岛风格底部固定栏 */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-lg border"
          style={{ border: '1px solid #e8d5b8', boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(201,168,124,0.15)' }}>
          <div className="flex items-center gap-1.5 pl-1 pr-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a88a5c', boxShadow: '0 0 6px #c9a87c88' }} />
            <span className="text-xs font-medium" style={{ color: '#2a2a28' }}>立即预约</span>
          </div>
          <Link href="/appointments"
            className="px-5 py-2 rounded-full text-xs font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #b8956a)' }}
          >
            预约服务
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
