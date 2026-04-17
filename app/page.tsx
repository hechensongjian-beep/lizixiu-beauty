'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getProducts, getServices } from '@/lib/api';

interface Product { id: string; name: string; price: number; imageColor: string; imageUrl?: string; category: string; description: string; stock: number; tags?: string[]; }
interface Service { id: string; name: string; price: number; duration?: number; category?: string; description?: string; popularity?: number; }

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
}

export default function HomePage() {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const isMerchant = role === 'merchant' || role === 'admin';

  useEffect(() => {
    Promise.all([getProducts(), getServices()])
      .then(([prod, svc]) => {
        setProducts((prod?.products || []).slice(0, 4));
        setServices((svc?.services || []).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#faf8f5' }}>
      <main className="max-w-3xl mx-auto px-6 pb-28">

        {/* ========== 灵动岛 HEADER ========== */}
        <section className="relative pt-12 pb-16 text-center">
          {/* 背景光晕 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #c9a87c, transparent)' }} />
          </div>

          {/* Dynamic Island 风格横幅 */}
          <div className="relative mx-auto mt-4 mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-3xl bg-black text-white shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#222', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)' }} />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                <span className="text-xs font-medium tracking-wide">每日特惠 · 全场8折起</span>
              </span>
              <div className="w-px h-3.5 bg-white/20" />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>限时30分钟</span>
            </div>
          </div>

          {/* 品牌名 */}
          <p className="text-xs tracking-[0.6em] uppercase mb-4" style={{ color: '#c9a87c' }}>LIZIXIU BEAUTY</p>
          <h1 className="text-5xl md:text-6xl font-light leading-tight mb-4" style={{ fontFamily: "'Noto Serif SC', serif", color: '#2a2a28' }}>
            肌肤自然<br />焕发新生
          </h1>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: '#9b9b98', maxWidth: '320px', margin: '0 auto' }}>
            东方草本 · 现代美容科技 · 专属定制服务
          </p>

          {/* CTA 按钮 */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/appointments" className="px-8 py-3.5 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a87c 0%, #b8956a 100%)', boxShadow: '0 4px 16px rgba(201,168,124,0.35)' }}>
              立即预约
            </Link>
            <Link href="/services" className="px-8 py-3.5 rounded-full text-sm font-medium transition-all"
              style={{ border: '1px solid #e8d5b8', color: '#a88a5c' }}>
              了解服务
            </Link>
          </div>
        </section>

        {/* ========== 分类导航 ========== */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-center mb-5 tracking-wide" style={{ color: '#2a2a28', fontFamily: "'Noto Serif SC', serif" }}>服务项目</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: '面部护理', desc: '清洁·补水·焕肤', href: '/services' },
              { name: '身体护理', desc: 'SPA·塑形·放松', href: '/services' },
              { name: '特色护理', desc: '私密·高端·定制', href: '/services' },
            ].map((cat) => (
              <Link key={cat.name} href={cat.href}
                className="group bg-white rounded-2xl p-5 text-center border transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ border: '1px solid #f0ebe3' }}>
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a87c15, #e8d5b815)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#c9a87c' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: '#2a2a28' }}>{cat.name}</div>
                <div className="text-xs" style={{ color: '#b0b0ad' }}>{cat.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 热门服务 ========== */}
        {services.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium" style={{ color: '#2a2a28' }}>热门服务</h2>
              <Link href="/services" className="text-xs font-medium" style={{ color: '#a88a5c' }}>全部 →</Link>
            </div>
            <div className="space-y-2">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-5 py-4 group transition hover:shadow-sm"
                  style={{ border: '1px solid #f0ebe3' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c9a87c, #e8d5b8)' }}>
                      {svc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#2a2a28' }}>{svc.name}</div>
                      {svc.duration && <div className="text-xs" style={{ color: '#b0b0ad' }}>{svc.duration} 分钟</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: '#a88a5c' }}>{fmtCurrency(svc.price)}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: '#c9a87c' }}>预约</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========== 精选产品 ========== */}
        {products.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium" style={{ color: '#2a2a28' }}>精选产品</h2>
              <Link href="/products" className="text-xs font-medium" style={{ color: '#a88a5c' }}>全部 →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ border: '1px solid #f0ebe3' }}>
                  <div className="h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f0e8, #e8d5b8)' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white/60" style={{ fontFamily: "'Noto Serif SC', serif" }}>{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium truncate mb-0.5" style={{ color: '#2a2a28' }}>{p.name}</div>
                    <div className="font-bold text-sm" style={{ color: '#a88a5c' }}>{fmtCurrency(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========== 会员卡片 ========== */}
        <section className="mb-8">
          <div className="rounded-2xl p-6 text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #2d4a3e 0%, #3d6352 100%)' }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
            <div className="relative">
              <div className="text-xs opacity-70 mb-2 tracking-widest">丽姿秀会员卡</div>
              <div className="text-xl font-bold mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>尊享专属权益</div>
              <div className="text-xs opacity-70 mb-5">最高可享 8.5 折优惠</div>
              <div className="flex gap-2">
                <Link href="/appointments" className="px-5 py-2 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 transition">
                  预约服务
                </Link>
                <Link href="/auth/register" className="px-5 py-2 rounded-full text-xs font-bold bg-white text-[#2d4a3e] hover:bg-white/90 transition">
                  成为会员
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 快捷入口 ========== */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '在线预约', href: '/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#c9a87c' },
              { label: '我的订单', href: '/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: '#6b9e78' },
              { label: '产品商城', href: '/products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: '#8b9ec9' },
              { label: '联系客服', href: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#c98b8b' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 transition hover:shadow-sm hover:-translate-y-0.5"
                style={{ border: '1px solid #f0ebe3' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '22' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: '#2a2a28' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ========== 底部标签栏 ========== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-20 safe-bottom"
        style={{ borderColor: 'rgba(201,168,124,0.12)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
        <div className="max-w-3xl mx-auto flex">
          {[
            { label: '首页', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
            { label: '服务', href: '/services', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
            { label: '预约', href: '/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { label: '我的', href: role ? '/profile' : '/auth/login', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-center transition">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={item.active ? '#c9a87c' : 'none'} stroke={item.active ? '#c9a87c' : '#9b9b98'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-xs" style={{ color: item.active ? '#c9a87c' : '#9b9b98' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
