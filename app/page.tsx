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
        <div className="w-full py-2.5 px-4 text-center text-white font-medium tracking-wider"
          style={{ background: 'var(--accent)', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
          {siteSettings.notice_bar}
        </div>
      )}

      {/* ===== HERO - 高奢暗色意境首屏 ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh', background: 'linear-gradient(165deg, #1a1a1a 0%, #2a2a28 50%, #1f1f1f 100%)' }}>
        {/* 微妙的装饰线条 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 左上角装饰 */}
          <div className="absolute top-20 left-10 w-px h-32" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.3), transparent)' }} />
          <div className="absolute top-20 left-10 w-32 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,124,0.3), transparent)' }} />
          {/* 右下角装饰 */}
          <div className="absolute bottom-32 right-16 w-px h-24" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.2), transparent)' }} />
          <div className="absolute bottom-32 right-16 w-24 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,124,0.2), transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-8 flex flex-col justify-center" style={{ minHeight: '85vh' }}>
          {/* 顶部小标签 */}
          <div className="mb-10 tracking-widest" style={{ color: 'rgba(201,168,124,0.7)', fontSize: '0.6875rem', letterSpacing: '0.25em', fontWeight: 500 }}>
            {siteSettings.hero_subtitle}
          </div>

          {/* 主标题 - 大字衬线体 */}
          <h1 className="leading-snug mb-8 max-w-3xl"
            style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: '#f5f5f5', letterSpacing: '0.02em', lineHeight: 1.3 }}>
            {siteSettings.hero_title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < siteSettings.hero_title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* 装饰线 */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px" style={{ background: 'var(--primary)' }} />
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>

          {/* 描述 */}
          <p className="max-w-xl mb-12 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.9 }}>
            {siteSettings.hero_desc}
          </p>

          {/* 按钮组 - 高对比度设计 */}
          <div className="flex items-center gap-5 flex-wrap">
            <Link href="/appointments"
              className="group inline-flex items-center justify-center gap-3 transition-all duration-300"
              style={{
                background: 'transparent',
                padding: '1rem 2.25rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              立即预约
            </Link>
            <Link href="/services"
              className="group inline-flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: 'transparent',
                padding: '1rem 2rem',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9375rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
              }}>
              浏览服务
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* 底部信息 */}
          <div className="absolute bottom-10 left-8 right-8 flex items-center justify-between max-w-6xl mx-auto" style={{ maxWidth: '72rem' }}>
            <div className="flex items-center gap-6" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              <span>{siteSettings.business_hours}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              <span>{siteSettings.business_tel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 品牌承诺 - 简洁横排 ===== */}
      <section className="py-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '正品保障' },
              { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: '满500包运' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '7天无理由' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: '随时预约' },
            ].map((item, idx) => (
              <div key={item.label} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--primary-light)',
                    borderRadius: '50%',
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div style={{ color: 'var(--foreground)', fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 服务项目 - 简约列表 ===== */}
      <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-6xl mx-auto px-8">
          {/* 标题区 */}
          <div className="text-center mb-16">
            <div className="tracking-widest mb-3" style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.25em' }}>SERVICES</div>
            <h2 className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '2rem', fontWeight: 400 }}>
              精选服务项目
            </h2>
            <div className="w-12 h-px mx-auto" style={{ background: 'var(--primary-light)' }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white/50 rounded-lg p-8 animate-pulse" style={{ minHeight: '200px' }} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--foreground-muted)', fontSize: '0.9375rem' }}>
              商家正在准备中，敬请期待
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="group flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                  style={{ borderBottom: '1px solid var(--primary-light)' }}>
                  <div className="flex-1">
                    <h3 style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '1.125rem', fontWeight: 500 }}>{svc.name}</h3>
                    {svc.description && (
                      <p className="mt-1 line-clamp-1" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{svc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium" style={{ color: 'var(--primary)', fontSize: '1rem' }}>{fmtCurrency(svc.price)}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 transition-all duration-300"
              style={{
                border: '1px solid var(--foreground-muted)',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}>
              查看全部服务
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 产品展示 - 精选卡片 ===== */}
      <section className="py-20" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto px-8">
          {/* 标题区 */}
          <div className="text-center mb-16">
            <div className="tracking-widest mb-3" style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.25em' }}>PRODUCTS</div>
            <h2 className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '2rem', fontWeight: 400 }}>
              精选护肤产品
            </h2>
            <div className="w-12 h-px mx-auto" style={{ background: 'var(--primary-light)' }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-100 rounded" style={{ height: '280px' }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--foreground-muted)', fontSize: '0.9375rem' }}>
              商家正在准备中，敬请期待
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((prod) => (
                <Link key={prod.id} href={`/products?id=${prod.id}`}
                  className="group block">
                  {/* 图片区 */}
                  <div className="aspect-[3/4] mb-4 overflow-hidden bg-gray-100 relative"
                    style={{ background: 'var(--background-secondary)' }}>
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(145deg, #e8e4df 0%, #d8d4cf 100%)' }}>
                        <span style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 300 }}>
                          {prod.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 信息 */}
                  <h3 className="mb-1" style={{ color: 'var(--foreground)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {prod.name}
                  </h3>
                  <p className="font-medium" style={{ color: 'var(--primary)', fontSize: '0.9375rem' }}>
                    {fmtCurrency(prod.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 transition-all duration-300"
              style={{
                border: '1px solid var(--foreground-muted)',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}>
              查看全部产品
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 用户评价 - 简约引用 ===== */}
      <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-4xl mx-auto px-8">
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((r) => (
                <div key={r.id} className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.score || 5 }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4" style={{ color: 'var(--foreground)', fontSize: '0.9375rem', lineHeight: 1.8, fontStyle: 'italic' }}>
                    "{r.text}"
                  </p>
                  <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>— {r.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '1.5rem', fontWeight: 400, lineHeight: 1.8 }}>
                "每次护理都让我感觉焕然一新，<br />技师非常专业细致。"
              </p>
              <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>— 王女士，上海静安</div>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA - 高奢暗色风格 ===== */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(165deg, #1a1a1a 0%, #2a2a28 100%)' }}>
        {/* 装饰 */}
        <div className="absolute top-8 left-8 w-px h-24" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.25), transparent)' }} />
        <div className="absolute bottom-8 right-8 w-px h-24" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.15), transparent)' }} />

        <div className="relative max-w-3xl mx-auto px-8 text-center">
          <div className="tracking-widest mb-4" style={{ color: 'rgba(201,168,124,0.6)', fontSize: '0.6875rem', letterSpacing: '0.25em' }}>
            BEGIN YOUR JOURNEY
          </div>
          <h2 className="mb-6" style={{ fontFamily: "'Noto Serif SC', serif", color: '#f5f5f5', fontSize: '2rem', fontWeight: 400 }}>
            开启您的美丽之旅
          </h2>
          <div className="w-12 h-px mx-auto mb-8" style={{ background: 'var(--primary)' }} />
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', lineHeight: 1.8 }}>
            预约专属护理服务，体验丽姿秀带来的蜕变
          </p>
          <Link href="/appointments"
            className="inline-flex items-center justify-center gap-3 transition-all duration-300"
            style={{
              background: 'var(--primary)',
              padding: '1rem 2.5rem',
              color: '#1a1a1a',
              fontSize: '0.9375rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            立即预约
          </Link>
        </div>
      </section>

    </div>
  );
}
