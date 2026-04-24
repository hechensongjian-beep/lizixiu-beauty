'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getProducts, getServices, getTestimonials } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Product { id: string; name: string; price: number; imageColor: string; imageUrl?: string; category: string; description: string; stock: number; tags?: string[]; }
interface Service { id: string; name: string; price: number; duration?: number; category?: string; description?: string; popularity?: number; }
interface Testimonial { id: string; name: string; avatar?: string; service?: string; text: string; score: number; }
interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_desc: string;
  business_hours: string;
  business_tel: string;
  business_addr: string;
  notice_bar: string;
}

const DEFAULTS: SiteSettings = {
  hero_title: '肌肤自然\n焕发新生',
  hero_subtitle: '东方草本 · 现代美容科技',
  hero_desc: '丽姿秀专注于东方草本美容理念，结合现代先进美容科技，为您提供专属定制的高端护理服务。',
  business_hours: '周一至周日 09:00 - 21:00',
  business_tel: '139-0000-0001',
  business_addr: '上海市静安区南京西路1266号',
  notice_bar: '',
};

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
}

export default function HomePage() {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const isMerchant = role === 'merchant' || role === 'admin';

  useEffect(() => {
    Promise.all([
      getProducts(),
      getServices(),
      getTestimonials(),
      supabase.from('site_settings').select('*').eq('id', 1).single()
    ])
      .then(([prod, svc, test, settings]) => {
        setProducts((prod?.products || []).slice(0, 4));
        setServices((svc?.services || []).slice(0, 4));
        setTestimonials(test?.testimonials || []);
        if (settings.data && !settings.error) {
          setSiteSettings({
            hero_title: settings.data.hero_title || DEFAULTS.hero_title,
            hero_subtitle: settings.data.hero_subtitle || DEFAULTS.hero_subtitle,
            hero_desc: settings.data.hero_desc || DEFAULTS.hero_desc,
            business_hours: settings.data.business_hours || DEFAULTS.business_hours,
            business_tel: settings.data.business_tel || DEFAULTS.business_tel,
            business_addr: settings.data.business_addr || DEFAULTS.business_addr,
            notice_bar: settings.data.notice_bar || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* 公告栏 */}
      {siteSettings.notice_bar && (
        <div className="w-full py-2 px-4 text-center text-white text-sm font-medium"
          style={{ background: 'var(--accent)', fontSize: '0.8125rem', letterSpacing: '0.05em' }}>
          {siteSettings.notice_bar}
        </div>
      )}

      {/* ===== HERO - 高奢意境首屏 ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '560px' }}>
        {/* 背景 */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=85&auto=format&fit=crop"
            alt="丽姿秀美容工作室"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(45,74,62,0.88) 0%, rgba(92,82,68,0.82) 40%, rgba(201,168,124,0.65) 100%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 flex items-center" style={{ minHeight: '560px' }}>
          <div className="max-w-2xl py-20">
            {/* 品牌标签 */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/80 mb-8"
              style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', fontSize: '0.8125rem', letterSpacing: '0.1em' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a87c' }} />
              {siteSettings.hero_subtitle}
            </div>

            {/* 主标题 */}
            <h1 className="text-white leading-tight mb-6" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '2.75rem', fontWeight: 700, letterSpacing: '0.02em' }}>
              {siteSettings.hero_title.split('\n').map((line, i) => (
                <span key={i}>{line}{i < siteSettings.hero_title.split('\n').length - 1 ? <br /> : ''}</span>
              ))}
            </h1>

            {/* 描述 */}
            <p className="text-white/65 mb-10 leading-relaxed" style={{ fontSize: '0.9375rem', maxWidth: '480px' }}>
              {siteSettings.hero_desc}
            </p>

            {/* 按钮组 - 图标和文字居中对齐 */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/appointments"
                className="inline-flex items-center justify-center gap-2 text-white transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'linear-gradient(135deg, #c9a87c 0%, #b8976a 100%)',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 20px rgba(201,168,124,0.35)',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                立即预约
              </Link>
              <Link href="/services"
                className="inline-flex items-center justify-center gap-2 text-white/80 transition-all hover:text-white"
                style={{
                  background: 'transparent',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}>
                浏览服务
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 品牌承诺 - 简洁精致 ===== */}
      <section className="py-6" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '正品保障', desc: '全店正品，假一赔十' },
              { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: '满500免运费', desc: '全场满500元包邮' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '7天无理由', desc: '不满意可退换' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: '营业时间', desc: siteSettings.business_hours },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg" style={{ border: '1px solid var(--primary-light)' }}>
                <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', backgroundImage: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div>
                  <div className="font-medium" style={{ fontSize: '0.8125rem', color: 'var(--foreground)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 服务项目 - 精致卡片 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Services</div>
              <h2 style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>精选服务项目</h2>
            </div>
            <Link href="/services" className="flex items-center gap-1.5 font-medium hover:underline" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
              查看全部 <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse" style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="h-12 w-12 rounded-xl bg-gray-200 mb-4"></div>
                  <div className="h-5 w-1/3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl" style={{ border: '1px solid var(--primary-light)' }}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
              <p className="font-medium mb-2" style={{ color: 'var(--foreground)', fontSize: '1rem' }}>暂无服务项目</p>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>商家正在准备中，敬请期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="group bg-white rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', fontSize: '1.125rem' }}>
                      {svc.name.charAt(0)}
                    </div>
                    {svc.duration && (
                      <span className="px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                        {svc.duration}分钟
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif", fontSize: '1.0625rem' }}>{svc.name}</h3>
                  {svc.description && (
                    <p className="mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', lineHeight: '1.6' }}>{svc.description}</p>
                  )}
                  <div className="flex items-end justify-between pt-3" style={{ borderTop: '1px solid var(--primary-light)' }}>
                    <div>
                      <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>{fmtCurrency(svc.price)}</span>
                      <span className="ml-0.5" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>起</span>
                    </div>
                    <span className="font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--primary)', fontSize: '0.8125rem' }}>
                      详情 →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 产品展示 - 精致展示 ===== */}
      <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Products</div>
              <h2 style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>精选护肤产品</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 font-medium hover:underline" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
              查看全部 <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-5 w-2/3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl" style={{ border: '1px solid var(--primary-light)' }}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <p className="font-medium mb-2" style={{ color: 'var(--foreground)', fontSize: '1rem' }}>暂无产品</p>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>商家正在准备中，敬请期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((prod) => (
                <Link key={prod.id} href={`/products?id=${prod.id}`}
                  className="group bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg"
                  style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div className="relative h-48 overflow-hidden">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', fontSize: '1.5rem' }}>
                        {prod.name.charAt(0)}
                      </div>
                    )}
                    {prod.stock !== undefined && prod.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium" style={{ fontSize: '0.875rem' }}>已售罄</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold" style={{ color: 'var(--foreground)', fontSize: '0.9375rem' }}>{prod.name}</h3>
                      {prod.category && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.6875rem' }}>{prod.category}</span>
                      )}
                    </div>
                    {prod.description && (
                      <p className="mb-3 line-clamp-2" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{prod.description}</p>
                    )}
                    <div className="flex items-end justify-between">
                      <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.0625rem' }}>{fmtCurrency(prod.price)}</span>
                      <span className="font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--primary)', fontSize: '0.8125rem' }}>
                        详情 →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 用户评价 - 优雅展示 ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <div className="tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Testimonials</div>
            <h2 style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>用户真实评价</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(testimonials.length > 0 ? testimonials : [
              { id: '1', name: '王女士', avatar: '王', text: '做了面部深层清洁，皮肤状态明显改善了很多！技师手法很专业，环境也很舒适，强烈推荐！', score: 5, service: '面部护理' },
              { id: '2', name: '李女士', avatar: '李', text: '在这里办了会员卡，性价比很高。服务很细致，每次做完都感觉整个人精神了很多。', score: 5, service: '身体SPA' },
              { id: '3', name: '张女士', avatar: '张', text: '第一次体验就爱上了！预约很方便，技师会根据你的肤质推荐合适的项目，很贴心。', score: 5, service: '面部补水' },
            ]).map((r, idx) => (
              <div key={r.id || idx} className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--primary-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', fontSize: '0.9375rem' }}>
                    {r.avatar || r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.875rem' }}>{r.name}</div>
                    <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>{r.service}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.score || 5 }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#c9a87c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', lineHeight: '1.7' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA - 高奢品牌氛围 ===== */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'var(--accent)' }}>
        {/* 装饰性渐变 */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(201,168,124,0.4) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto px-8 text-center">
          <div className="tracking-widest mb-3 uppercase text-white/50" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>Begin Your Journey</div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.875rem' }}>开启您的美丽之旅</h2>
          <div className="ornament-line mb-5">
            <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>✦</span>
          </div>
          <p className="text-white/60 mb-8" style={{ fontSize: '0.875rem' }}>
            预约专属护理服务，体验丽姿秀带来的蜕变
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/appointments"
              className="inline-flex items-center justify-center gap-2 text-white transition-all hover:translate-y-[-1px]"
              style={{
                background: 'linear-gradient(135deg, #c9a87c 0%, #b8976a 100%)',
                padding: '0.75rem 1.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                boxShadow: '0 4px 20px rgba(201,168,124,0.35)',
              }}>
              立即预约
            </Link>
            <Link href={`tel:${siteSettings.business_tel.replace(/-/g, '')}`}
              className="inline-flex items-center justify-center gap-2 text-white/70 transition-all hover:text-white"
              style={{
                background: 'transparent',
                padding: '0.75rem 1.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              电话咨询
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
