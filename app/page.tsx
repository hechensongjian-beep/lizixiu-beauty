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

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '580px' }}>
        {/* 背景图 */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1600&q=80&auto=format&fit=crop"
            alt="丽姿秀美容工作室"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(45,74,62,0.85) 0%, rgba(61,99,82,0.75) 50%, rgba(74,122,99,0.65) 100%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style={{ minHeight: '440px' }}>
            {/* 左侧文字 */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/90 mb-8" style={{ background: 'rgba(201,168,124,0.25)', border: '1px solid rgba(201,168,124,0.4)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a87c' }} />
                东方草本 · 现代美容科技
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                肌肤自然<br />焕发新生
              </h1>
              <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
                丽姿秀专注于东方草本美容理念，结合现代先进美容科技，为您提供专属定制的高端护理服务，让每位顾客都能感受到独特的美丽蜕变。
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/appointments"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
                  style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(201,168,124,0.45)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  立即预约
                </Link>
                <Link href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
                  浏览服务
                </Link>
              </div>
            </div>

            {/* 右侧数据卡 */}
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: '500+', label: '忠实会员', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#c9a87c' },
                { value: '5年+', label: '行业深耕', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#6b9e78' },
                { value: '98%', label: '顾客好评', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: '#f59e0b' },
                { value: '100%', label: '天然成分', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: '#8b9ec9' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: stat.color + '33' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={stat.icon} />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 品牌承诺 ===== */}
      <section className="py-6" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '正品保障', desc: '全店正品，假一赔十' },
              { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: '满500免运费', desc: '全场满500元包邮' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '7天无理由', desc: '不满意可退换' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: '营业时间', desc: '周一至周日 09:00-20:00' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl" style={{ border: '1px solid var(--primary-light)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', backgroundImage: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.label}</div>
                  <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 服务项目 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
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
                  <div className="h-14 w-14 rounded-2xl bg-gray-200 mb-4"></div>
                  <div className="h-5 w-1/3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid var(--primary-light)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>暂无服务项目</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>商家正在准备中，敬请期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="group bg-white rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
                      {svc.name.charAt(0)}
                    </div>
                    {svc.duration && (
                      <span className="text-xs px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--foreground-muted)' }}>
                        {svc.duration}分钟
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>{svc.name}</h3>
                  {svc.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{svc.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--primary-light)' }}>
                    <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{fmtCurrency(svc.price)}</span>
                    <span className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-all group-hover:shadow"
                      style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(201,168,124,0.3)' }}>
                      立即预约
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 品牌故事 ===== */}
      <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左侧图片 */}
            <div className="relative rounded-3xl overflow-hidden h-80 lg:h-96">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80&auto=format&fit=crop"
                alt="丽姿秀美容工作室"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, var(--background-secondary))' }} />
            </div>

            {/* 右侧文字 */}
            <div>
              <div className="text-xs font-medium tracking-widest mb-3 uppercase" style={{ color: 'var(--primary)' }}>Our Story</div>
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)' }}>
                五年深耕 · 东方草本美容理念
              </h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                <p>丽姿秀诞生于对东方草本美容的热爱与执着。我们相信，真正的美丽源于自然的馈赠与现代科技的完美融合。</p>
                <p>五年来，我们始终坚守「天然、安全、有效」的服务理念，精选国内外优质草本成分，结合先进美容科技，为每位顾客量身定制最适合的护理方案。</p>
                <p>在丽姿秀，每一次护理都是一次身心的愉悦享受。我们用专业与真诚，赢得500多位会员的信赖与支持。</p>
              </div>
              <div className="mt-8 flex items-center gap-6">
                {[
                  { v: '500+', l: '会员信赖' },
                  { v: '5年+', l: '行业经验' },
                  { v: '98%', l: '好评率' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{s.v}</div>
                    <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 精选产品 ===== */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Products</div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>精选美容产品</h2>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                商城全部 <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {products.map((p) => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="h-36 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f0e8, #e8d5b8)' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-4xl font-bold text-white/50" style={{ fontFamily: "'Noto Serif SC', serif" }}>{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-bold mb-0.5 truncate" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{fmtCurrency(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 用户口碑 ===== */}
      <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Testimonials</div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)' }}>用户真实评价</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '王女士', avatar: '王', text: '做了面部深层清洁，皮肤状态明显改善了很多！技师手法很专业，环境也很舒适，强烈推荐！', score: 5, service: '面部护理' },
              { name: '李女士', avatar: '李', text: '在这里办了会员卡，性价比很高。服务很细致，每次做完都感觉整个人精神了很多。支持！', score: 5, service: '身体SPA' },
              { name: '张女士', avatar: '张', text: '第一次体验就爱上了！预约很方便，技师会根据你的肤质推荐合适的项目，很贴心。', score: 5, service: '面部补水' },
            ].map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{r.name}</div>
                    <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{r.service}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.score }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 会员卡 CTA ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-10 text-white" style={{ background: 'linear-gradient(135deg, #2d4a3e 0%, #3d6352 50%, #4a7a63 100%)' }}>
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white" />
            <div className="relative max-w-2xl">
              <div className="text-xs font-medium tracking-widest mb-3 opacity-70">MEMBERSHIP</div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>成为丽姿秀尊享会员</h2>
              <p className="text-white/65 text-sm mb-8 leading-relaxed">
                加入丽姿秀会员，享受专属折扣、生日特惠、优先预约等多重权益，最高可享 8.5 折优惠。
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {['会员专属折扣', '生日特惠礼遇', '优先预约服务', '积分兑换好礼'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/auth/register" className="px-8 py-3 rounded-xl bg-white text-[#2d4a3e] font-semibold text-sm hover:bg-white/90 transition">
                  立即注册
                </Link>
                <Link href="/appointments" className="px-8 py-3 rounded-xl font-semibold text-sm text-white transition" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
                  预约服务
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 快捷功能 ===== */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '在线预约', href: '/appointments', desc: '快速预约服务时间', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'var(--primary)' },
              { label: '我的订单', href: '/orders', desc: '查看订单状态', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: '#6b9e78' },
              { label: '产品商城', href: '/products', desc: '精选美容产品', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', bg: '#8b9ec9' },
              { label: '在线咨询', href: '/chat', desc: '随时联系客服', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', bg: '#c98b8b' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="group bg-white rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ border: '1px solid var(--primary-light)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: item.bg + '22' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={item.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>{item.label}</div>
                <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 商家入口 ===== */}
      {isMerchant && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl p-8 flex items-center justify-between" style={{ border: '2px solid var(--primary-light)' }}>
              <div>
                <div className="text-xs font-medium tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)' }}>Merchant Portal</div>
                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)' }}>商家管理后台</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>管理订单、数据、服务项目、员工排班等</p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/dashboard" className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md" style={{ border: '2px solid var(--primary)', color: 'var(--primary)' }}>
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
