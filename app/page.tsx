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
        setProducts((prod?.products || []).slice(0, 6));
        setServices((svc?.services || []).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ===== 品牌横幅 ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d4a3e 0%, #3d6352 50%, #4a7a63 100%)' }}>
        {/* 背景纹理 */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a87c 0%, transparent 50%), radial-gradient(circle at 80% 50%, #e8d5b8 0%, transparent 50%)',
        }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文字 */}
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium text-white/80 mb-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                ✨ 东方草本 · 现代美容科技
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                肌肤自然<br />焕发新生
              </h1>
              <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
                丽姿秀专注于东方草本美容理念，结合现代先进美容科技，为您提供专属定制的高端护理服务，让每位顾客都能感受到独特的美丽蜕变。
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/appointments"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(201,168,124,0.4)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  立即预约
                </Link>
                <Link href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                  了解服务
                </Link>
              </div>
            </div>

            {/* 右侧数据 */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '500+', label: '忠实会员', color: '#c9a87c' },
                { value: '5年+', label: '行业经验', color: '#6b9e78' },
                { value: '98%', label: '顾客满意度', color: '#8b9ec9' },
                { value: '100%', label: '天然成分', color: '#c98b8b' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 服务项目 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Services</div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>精选服务项目</h2>
            </div>
            <Link href="/services" className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              查看全部 <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid var(--primary-light)' }}>
              <p style={{ color: 'var(--foreground-muted)' }}>暂无服务项目，商家正在准备中</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="group bg-white rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
                      {svc.name.charAt(0)}
                    </div>
                    {svc.duration && (
                      <span className="text-xs px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--accent)' }}>
                        {svc.duration}分钟
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>{svc.name}</h3>
                  {svc.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{svc.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{fmtCurrency(svc.price)}</span>
                    <span className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-all group-hover:shadow"
                      style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(201,168,124,0.3)' }}>
                      查看详情
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 产品商城 ===== */}
      {products.length > 0 && (
        <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Products</div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>精选产品商城</h2>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                查看全部 <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {products.map((p) => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="h-36 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f0e8, #e8d5b8)' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-4xl font-bold text-white/60" style={{ fontFamily: "'Noto Serif SC', serif" }}>{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-bold mb-1 truncate" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{fmtCurrency(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 会员权益 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 会员卡 */}
            <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #2d4a3e, #3d6352)' }}>
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10 bg-white" />
              <div className="relative p-10">
                <div className="text-white/50 text-xs tracking-widest mb-4">MEMBERSHIP</div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>丽姿秀尊享会员</h3>
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                  成为丽姿秀会员，享受专属折扣、生日特惠、优先预约等多项权益，最高可享 8.5 折优惠。
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['会员专属折扣', '生日特惠礼遇', '优先预约服务', '积分兑换好礼'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href="/auth/register" className="px-6 py-3 rounded-xl bg-white text-[#2d4a3e] font-semibold text-sm hover:bg-white/90 transition">
                    成为会员
                  </Link>
                  <Link href="/appointments" className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                    预约服务
                  </Link>
                </div>
              </div>
            </div>

            {/* 快捷功能 */}
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: '在线预约', href: '/appointments', desc: '快速预约服务时间', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'var(--primary)' },
                { label: '产品商城', href: '/products', desc: '精选美容产品', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', bg: '#6b9e78' },
                { label: '我的订单', href: '/orders', desc: '查看订单状态', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: '#8b9ec9' },
                { label: '在线咨询', href: '/chat', desc: '随时联系客服', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', bg: '#c98b8b' },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="group bg-white rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: item.bg + '22' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={item.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>{item.label}</div>
                  <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 商家入口 ===== */}
      {isMerchant && (
        <section className="py-12" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl p-8 flex items-center justify-between" style={{ border: '1px solid var(--primary-light)' }}>
              <div>
                <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Merchant Portal</div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>商家管理后台</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>管理订单、数据、服务项目、员工排班等</p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/dashboard" className="px-8 py-3 rounded-xl bg-white font-semibold text-sm transition-all hover:shadow-md" style={{ border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                  管理后台
                </Link>
                <Link href="/admin/orders" className="px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-md" style={{ background: 'var(--primary)' }}>
                  查看订单
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
