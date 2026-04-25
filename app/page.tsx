'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getProducts, getServices, getTestimonials, getPromotions } from '@/lib/api';
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

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to: 'all' | 'products' | 'services';
}

// 全站统一主按钮：实心金色
function GoldBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="group inline-flex items-center justify-center gap-2.5 transition-all duration-300"
      style={{
        background: 'var(--primary)',
        padding: '0.875rem 2rem',
        border: '1px solid var(--primary)',
        color: '#1a1a1a',
        fontSize: '0.9375rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
      }}>
      {children}
    </Link>
  );
}

// 全站统一次级按钮：描边金
function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="group inline-flex items-center justify-center gap-2 transition-all duration-300"
      style={{
        background: 'transparent',
        padding: '0.875rem 2rem',
        border: '1px solid rgba(201,168,124,0.3)',
        color: 'rgba(201,168,124,0.75)',
        fontSize: '0.9375rem',
        fontWeight: 400,
        letterSpacing: '0.05em',
      }}>
      {children}
    </Link>
  );
}

// 智能图片组件：自动融合暗色背景
function BlendImg({ src, alt, imgClass, imgStyle }: {
  src?: string;
  alt: string;
  imgClass?: string;
  imgStyle?: React.CSSProperties;
}) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);

  if (!src || err) {
    return (
      <div style={{
        background: 'linear-gradient(160deg, #252320 0%, #1c1a18 50%, #252320 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Noto Serif SC', serif",
          color: 'rgba(201,168,124,0.35)',
          fontSize: '2.25rem',
          fontWeight: 300,
          letterSpacing: '0.1em',
          userSelect: 'none',
        }}>
          {alt.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={imgClass}
        style={{ ...imgStyle, opacity: ok ? 1 : 0, transition: 'opacity 0.4s ease' }}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
      {!ok && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, #252320 0%, #1c1a18 50%, #252320 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Noto Serif SC', serif",
            color: 'rgba(201,168,124,0.35)',
            fontSize: '2.25rem',
            fontWeight: 300,
          }}>
            {alt.charAt(0)}
          </span>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const isMerchant = role === 'merchant' || role === 'admin';

  useEffect(() => {
    Promise.all([
      getProducts(),
      getServices(),
      getTestimonials(),
      getPromotions(),
      supabase.from('site_settings').select('*').eq('id', 1).single()
    ])
      .then(([prod, svc, test, promo, settings]) => {
        setProducts((prod?.products || []).slice(0, 4));
        setServices((svc?.services || []).slice(0, 4));
        setTestimonials(test?.testimonials || []);
        setPromotions(promo?.promotions || []);
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
    <div className="min-h-screen" style={{ background: '#1a1a18' }}>

      {/* 公告栏 */}
      {siteSettings.notice_bar && (
        <div className="w-full py-2.5 px-4 text-center font-medium tracking-widest"
          style={{ background: 'var(--accent)', color: 'var(--primary)', fontSize: '0.8125rem' }}>
          {siteSettings.notice_bar}
        </div>
      )}

      {/* ===== HERO — 深色意境 ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '90vh', background: 'linear-gradient(165deg, #111110 0%, #1e1d1b 45%, #171614 100%)' }}>
        {/* 微妙金色光晕 */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)' }} />
        {/* 装饰线条 */}
        <div className="absolute top-24 left-12 w-px h-40" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.25), transparent)' }} />
        <div className="absolute top-24 left-12 w-40 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,124,0.25), transparent)' }} />
        <div className="absolute bottom-20 right-16 w-px h-32" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.15), transparent)' }} />
        <div className="absolute bottom-20 right-16 w-32 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,124,0.15), transparent)' }} />

        <div className="relative max-w-6xl mx-auto px-8 flex flex-col justify-center" style={{ minHeight: '90vh' }}>
          <div className="mb-10" style={{ color: 'rgba(201,168,124,0.55)', fontSize: '0.6875rem', letterSpacing: '0.28em', fontWeight: 500 }}>
            {siteSettings.hero_subtitle}
          </div>

          <h1 className="mb-8 max-w-3xl"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)',
              fontWeight: 300,
              color: '#f0ede8',
              letterSpacing: '0.03em',
              lineHeight: 1.25,
            }}>
            {siteSettings.hero_title.split('\n').map((line, i) => (
              <span key={i}>{line}{i < siteSettings.hero_title.split('\n').length - 1 && <br />}</span>
            ))}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-px" style={{ background: 'var(--primary)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', opacity: 0.6 }} />
          </div>

          <p className="max-w-xl mb-14"
            style={{ color: 'rgba(240,237,232,0.4)', fontSize: '1rem', lineHeight: 2, letterSpacing: '0.02em' }}>
            {siteSettings.hero_desc}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <GoldBtn href="/appointments">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              立即预约
            </GoldBtn>
            <GhostBtn href="/services">
              浏览服务
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </GhostBtn>
          </div>

          <div className="absolute bottom-10 left-8 right-8 flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-6" style={{ color: 'rgba(240,237,232,0.3)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <span>{siteSettings.business_hours}</span>
              <span style={{ color: 'rgba(240,237,232,0.12)' }}>|</span>
              <span>{siteSettings.business_tel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 促销活动 ===== */}
      {promotions.length > 0 && (
        <section style={{ background: '#1a1a18', padding: '3rem 0' }}>
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.slice(0, 2).map((promo) => (
                <div key={promo.id}
                  className="relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #1e1e1c 0%, #262420 100%)', borderRadius: '0.75rem', border: '1px solid rgba(201,168,124,0.12)' }}>
                  <div className="absolute top-0 right-0 w-28 h-28"
                    style={{ background: 'radial-gradient(circle at top right, rgba(201,168,124,0.1) 0%, transparent 70%)' }} />
                  <div className="relative">
                    <div className="mb-3" style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.25em', fontWeight: 500 }}>PROMOTION</div>
                    <h3 style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: '1.375rem', fontWeight: 400, marginBottom: '0.5rem' }}>
                      {promo.title}
                    </h3>
                    {promo.description && (
                      <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: '0.8125rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                        {promo.description}
                      </p>
                    )}
                    <span className="inline-flex px-4 py-2"
                      style={{ background: 'var(--primary)', color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.25rem', letterSpacing: '0.05em' }}>
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}% OFF`
                        : `立减 ¥${promo.discount_value}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 品牌承诺 ===== */}
      <section style={{ background: '#1a1a18', padding: '3rem 0', borderTop: '1px solid rgba(201,168,124,0.06)' }}>
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: '正品保障', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { label: '满500包运', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              { label: '7天无理由', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
              { label: '随时预约', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                  style={{ border: '1px solid rgba(201,168,124,0.25)', borderRadius: '50%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div style={{ color: 'rgba(240,237,232,0.6)', fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 服务项目 ===== */}
      <section style={{ background: '#222220', padding: '5rem 0' }}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <div className="mb-3" style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.28em', fontWeight: 500 }}>SERVICES</div>
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, marginBottom: '1rem' }}>
              精选服务项目
            </h2>
            <div className="w-12 h-px mx-auto" style={{ background: 'var(--primary)', opacity: 0.4 }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', minHeight: '160px', borderRadius: '0.75rem' }} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'rgba(240,237,232,0.3)', fontSize: '0.9375rem' }}>
              商家正在准备中，敬请期待
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="group block p-6 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,124,0.08)', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: '1.0625rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    {svc.name}
                  </h3>
                  {svc.description && (
                    <p className="mb-4 line-clamp-2" style={{ color: 'rgba(240,237,232,0.4)', fontSize: '0.8125rem', lineHeight: 1.7 }}>
                      {svc.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(201,168,124,0.08)' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 500 }}>{fmtCurrency(svc.price)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <GhostBtn href="/services">
              查看全部服务
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </GhostBtn>
          </div>
        </div>
      </section>

      {/* ===== 产品展示 ===== */}
      <section style={{ background: '#1a1a18', padding: '5rem 0' }}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <div className="mb-3" style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.28em', fontWeight: 500 }}>PRODUCTS</div>
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, marginBottom: '1rem' }}>
              精选护肤产品
            </h2>
            <div className="w-12 h-px mx-auto" style={{ background: 'var(--primary)', opacity: 0.4 }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', minHeight: '280px', borderRadius: '0.75rem' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'rgba(240,237,232,0.3)', fontSize: '0.9375rem' }}>
              商家正在准备中，敬请期待
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((prod) => (
                <Link key={prod.id} href={`/products?id=${prod.id}`} className="group block">
                  {/* 图片区：深色底 + 渐变叠层，让任何图片都与背景融为一体 */}
                  <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden relative"
                    style={{ background: '#1e1d1b', border: '1px solid rgba(201,168,124,0.06)' }}>
                    {/* 渐变叠层：图片底部自动融入背景 */}
                    <div className="absolute inset-0 z-10 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, #1a1a18 0%, rgba(26,26,24,0.5) 35%, transparent 55%)' }}
                    />
                    {/* 图片 */}
                    <BlendImg
                      src={prod.imageUrl}
                      alt={prod.name}
                      imgClass="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      imgStyle={{ zIndex: 1 }}
                    />
                    {/* 品牌首字（始终可见，作为视觉锚点） */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <span style={{
                        fontFamily: "'Noto Serif SC', serif",
                        color: 'var(--primary)',
                        fontSize: '1.375rem',
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                      }}>
                        {prod.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  {/* 信息 */}
                  <h3 style={{ color: '#f0ede8', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    {prod.name}
                  </h3>
                  <p style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 500 }}>
                    {fmtCurrency(prod.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <GhostBtn href="/products">
              查看全部产品
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </GhostBtn>
          </div>
        </div>
      </section>

      {/* ===== 用户评价 ===== */}
      <section style={{ background: '#222220', padding: '5rem 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((r) => (
                <div key={r.id} className="p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,124,0.06)', borderRadius: '0.75rem' }}>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.score || 5 }).map((_, i) => (
                      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="var(--primary)">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-5" style={{ color: 'rgba(240,237,232,0.65)', fontSize: '0.9375rem', lineHeight: 1.9, fontStyle: 'italic' }}>
                    "{r.text}"
                  </p>
                  <div style={{ color: 'rgba(240,237,232,0.3)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    — {r.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', fontWeight: 400, lineHeight: 2 }}>
                "每次护理都让我感觉焕然一新，<br />技师非常专业细致。"
              </p>
              <div style={{ color: 'rgba(240,237,232,0.3)', fontSize: '0.75rem', marginTop: '1rem' }}>— 王女士，上海静安</div>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-28 overflow-hidden" style={{ background: 'linear-gradient(165deg, #111110 0%, #1a1918 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.05) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.03) 0%, transparent 65%)' }} />
        <div className="absolute top-8 left-10 w-px h-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.2), transparent)' }} />
        <div className="absolute bottom-8 right-10 w-px h-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,124,0.15), transparent)' }} />

        <div className="relative max-w-3xl mx-auto px-8 text-center">
          <div className="mb-4" style={{ color: 'rgba(201,168,124,0.5)', fontSize: '0.6875rem', letterSpacing: '0.28em' }}>
            BEGIN YOUR JOURNEY
          </div>
          <h2 style={{ fontFamily: "'Noto Serif SC', serif", color: '#f0ede8', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 400, marginBottom: '1rem' }}>
            开启您的美丽之旅
          </h2>
          <div className="w-12 h-px mx-auto mb-8" style={{ background: 'var(--primary)', opacity: 0.5 }} />
          <p className="mb-12" style={{ color: 'rgba(240,237,232,0.4)', fontSize: '1rem', lineHeight: 1.9 }}>
            预约专属护理服务，体验丽姿秀带来的蜕变
          </p>
          <GoldBtn href="/appointments">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            立即预约
          </GoldBtn>
        </div>
      </section>

    </div>
  );
}
