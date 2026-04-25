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

// 首字母占位
function InitialAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div
      className="initial-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.4, borderRadius: '50%' }}
    >
      {initial}
    </div>
  );
}

// 产品图片
function ProductImage({ product, size = 220 }: { product: Product; size?: number }) {
  const [imgError, setImgError] = useState(false);
  if (imgError || !product.imageUrl) {
    return (
      <div
        className="initial-placeholder"
        style={{ width: '100%', height: size, fontSize: size * 0.28, borderRadius: 'var(--radius-xl)' }}
      >
        {product.name.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      onError={() => setImgError(true)}
      style={{ width: '100%', height: size, objectFit: 'cover', borderRadius: 'var(--radius-xl)' }}
    />
  );
}

// 装饰竖线
function GoldVerticalBar({ height = 40 }: { height?: number }) {
  return (
    <div
      style={{
        width: 1,
        height,
        background: 'linear-gradient(180deg, var(--primary), transparent)',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

// 大引号装饰
function LargeQuoteMark({ color = 'rgba(201,168,124,0.15)' }: { color?: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', lineHeight: 1, color, userSelect: 'none', fontWeight: 300, marginBottom: '-1rem' }}>
      "
    </div>
  );
}

// 装饰点阵
function GoldDotCluster({ count = 5 }: { count?: number }) {
  const dots = Array.from({ length: count });
  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
      {dots.map((_, i) => (
        <div
          key={i}
          style={{
            width: i === Math.floor(count / 2) ? 5 : 3,
            height: i === Math.floor(count / 2) ? 5 : 3,
            borderRadius: '50%',
            background: 'var(--primary)',
            opacity: i === Math.floor(count / 2) ? 0.7 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pData, sData, tData, promData] = await Promise.all([
          getProducts(), getServices(), getTestimonials(), getPromotions(),
        ]);
        setProducts(pData.slice(0, 6));
        setServices(sData.slice(0, 6));
        setTestimonials(tData.slice(0, 3));
        setPromotions(promData.filter((p: Promotion) => p.is_active));
      } catch (e) { console.error('加载失败', e); }
      try {
        const { data } = await supabase.from('site_settings').select('*').limit(1).single();
        if (data) setSettings({ ...DEFAULTS, ...data });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const heroTitle = settings.hero_title.replace(/\\n/g, '\n').split('\n');
  const activePromo = promotions[0];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>

      {/* ======== Hero区：左文字右意境 ======== */}
      <section
        style={{
          position: 'relative',
          background: 'var(--background)',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: '5rem',
          paddingBottom: '4rem',
        }}
      >
        {/* 右侧：精致几何装饰区 */}
        <div
          aria-hidden="true"
          className="hidden lg:flex"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '42%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {/* 外层装饰圆 */}
          <div style={{ position: 'relative', width: '420px', height: '420px' }}>
            {/* 最外圈：大圆环 */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid rgba(201,168,124,0.12)',
            }} />
            {/* 中圈：金色圆环 */}
            <div style={{
              position: 'absolute',
              inset: '40px',
              borderRadius: '50%',
              border: '1px solid rgba(201,168,124,0.25)',
            }} />
            {/* 内圈：主金色圆 */}
            <div style={{
              position: 'absolute',
              inset: '80px',
              borderRadius: '50%',
              border: '1px solid rgba(201,168,124,0.4)',
            }} />
            {/* 中心填充区 */}
            <div style={{
              position: 'absolute',
              inset: '110px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(201,168,124,0.06) 0%, rgba(201,168,124,0.02) 60%, transparent 100%)',
            }} />
            {/* 水平装饰线 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '-60px',
              right: '-60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,124,0.2) 20%, rgba(201,168,124,0.35) 50%, rgba(201,168,124,0.2) 80%, transparent 100%)',
              transform: 'translateY(-50%)',
            }} />
            {/* 垂直装饰线 */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '-60px',
              bottom: '-60px',
              width: '1px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,124,0.2) 20%, rgba(201,168,124,0.35) 50%, rgba(201,168,124,0.2) 80%, transparent 100%)',
              transform: 'translateX(-50%)',
            }} />
            {/* 顶部圆点装饰 */}
            <div style={{
              position: 'absolute',
              top: 'calc(50% - 160px)',
              left: '50%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--primary)',
              transform: 'translate(-50%, -50%)',
              opacity: 0.5,
            }} />
            {/* 底部圆点装饰 */}
            <div style={{
              position: 'absolute',
              bottom: 'calc(50% - 160px)',
              left: '50%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--primary)',
              transform: 'translate(-50%, 50%)',
              opacity: 0.5,
            }} />
          </div>
        </div>

        {/* 左侧：内容区 */}
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '580px' }}>

            {/* 顶部小装饰：金色竖线 + 英文小标签 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <GoldVerticalBar height={28} />
              <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em', fontWeight: 500 }}>
                {settings.hero_subtitle}
              </span>
            </div>

            {/* 主标题：超大衬线大字 */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                fontWeight: 300,
                color: 'var(--foreground)',
                lineHeight: 1.15,
                marginBottom: '2rem',
                letterSpacing: '0.02em',
              }}
            >
              {heroTitle.map((line, i) => (
                <span key={i} className="block" style={{ display: 'block' }}>
                  {i === 1 ? <span style={{ color: 'var(--primary)', fontWeight: 400 }}>{line}</span> : line}
                </span>
              ))}
            </h1>

            {/* 装饰横线 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '3rem', height: 1, background: 'var(--primary)' }} />
              <GoldDotCluster count={5} />
            </div>

            {/* 描述文字 */}
            <p
              style={{
                color: 'var(--foreground-muted)',
                fontSize: '1.0625rem',
                lineHeight: 1.9,
                marginBottom: '2.5rem',
                maxWidth: '440px',
              }}
            >
              {settings.hero_desc}
            </p>

            {/* 按钮组 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <Link
                href="/appointments"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2.25rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 24px rgba(45,74,62,0.25)',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                立即预约
              </Link>
              <Link
                href="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2.25rem',
                  background: 'transparent',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                浏览服务
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>

            {/* 促销标签 */}
            {activePromo && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(201,168,124,0.1)',
                  border: '1px solid rgba(201,168,124,0.25)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span style={{ color: 'var(--primary-dark)', fontSize: '0.8125rem' }}>
                  {activePromo.title} · {activePromo.discount_type === 'percentage' ? `${activePromo.discount_value}% OFF` : `立减¥${activePromo.discount_value}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 底部渐变遮罩 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.4), transparent)',
          }}
        />
      </section>

      {/* ======== 品牌承诺：大留白呼吸感 ======== */}
      <section style={{ background: 'var(--background-secondary)', padding: '6rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* 标题区：居中，小标签 + 大衬线标题 */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em' }}>BRAND PROMISE</span>
              <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
              东方之美 · 科学护肤
            </h2>
          </div>

          {/* 三列承诺：大间距，图标+文字 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                    <path d="M8 12c0-2.2 1.8-4 4-4"/>
                    <path d="M12 8v4l2.5 2.5"/>
                  </svg>
                ),
                title: '天然草本',
                desc: '甄选东方天然草本精华，古法与现代科技融合，温和养护每一寸肌肤',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                ),
                title: '现代科技',
                desc: '引进国际先进美容仪器设备，精准检测肌肤状态，科学制定护理方案',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ),
                title: '专属定制',
                desc: '资深美容师一对一诊断肤质，根据个人需求量身打造专属护理计划',
              },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '4.5rem',
                    height: '4.5rem',
                    borderRadius: '50%',
                    border: '1px solid rgba(201,168,124,0.3)',
                    marginBottom: '1.5rem',
                    background: 'var(--background)',
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--foreground)', letterSpacing: '0.05em' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9375rem', lineHeight: 1.8 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 服务项目 ======== */}
      <section style={{ background: 'var(--background)', padding: '6rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <GoldVerticalBar height={20} />
                <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em' }}>SERVICES</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
                专业护理服务
              </h2>
            </div>
            <Link
              href="/services"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-dark)', fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {services.map(service => (
                <Link
                  key={service.id}
                  href="/appointments"
                  style={{
                    display: 'block',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.15)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    transition: 'all 0.25s',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(201,168,124,0.15)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,124,0.35)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,124,0.15)';
                  }}
                >
                  {/* 左上角金色装饰 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3rem', height: '3px', background: 'var(--primary)', borderRadius: '0 0 2px 0' }} />

                  {service.category && (
                    <span style={{
                      display: 'inline-block',
                      marginBottom: '0.875rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: 'rgba(201,168,124,0.08)',
                      color: 'var(--primary-dark)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.05em',
                    }}>
                      {service.category}
                    </span>
                  )}

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1875rem', color: 'var(--foreground)', marginBottom: '0.625rem', letterSpacing: '0.03em' }}>
                    {service.name}
                  </h3>

                  {service.description && (
                    <p style={{
                      color: 'var(--foreground-muted)',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {service.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '1.0625rem', fontWeight: 600 }}>
                      {fmtCurrency(service.price)}
                    </span>
                    {service.duration && (
                      <span style={{ color: 'var(--foreground-light)', fontSize: '0.8125rem' }}>
                        {service.duration}分钟
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======== 精选产品 ======== */}
      <section style={{ background: 'var(--background-secondary)', padding: '6rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <GoldVerticalBar height={20} />
                <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em' }}>PRODUCTS</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
                明星产品
              </h2>
            </div>
            <Link
              href="/products"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-dark)', fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.75rem' }}>
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/product?id=${product.id}`}
                  style={{
                    display: 'block',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.12)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'all 0.25s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,168,124,0.18)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ padding: '1.25rem' }}>
                    <ProductImage product={product} size={200} />
                  </div>
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      marginBottom: '0.5rem',
                      padding: '0.2rem 0.625rem',
                      borderRadius: '999px',
                      background: 'rgba(201,168,124,0.08)',
                      color: 'var(--primary-dark)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.05em',
                    }}>
                      {product.category}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.0625rem', color: 'var(--foreground)', marginBottom: '0.375rem', letterSpacing: '0.02em' }}>
                      {product.name}
                    </h3>
                    <p style={{
                      color: 'var(--foreground-muted)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      marginBottom: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {product.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--primary)', fontSize: '1.0625rem', fontWeight: 600 }}>
                        {fmtCurrency(product.price)}
                      </span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span style={{ color: 'var(--rose)', fontSize: '0.6875rem' }}>
                          仅剩{product.stock}件
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======== 客户口碑 ======== */}
      {testimonials.length > 0 && (
        <section style={{ background: 'var(--background)', padding: '6rem 0' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em' }}>TESTIMONIALS</span>
                <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
                她们的真实感受
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
              {testimonials.map(t => (
                <div
                  key={t.id}
                  style={{
                    padding: '2rem',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.12)',
                    borderRadius: 'var(--radius-xl)',
                    position: 'relative',
                  }}
                >
                  {/* 大引号装饰 */}
                  <LargeQuoteMark />

                  {/* 评分 */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '1.25rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                        fill={i < t.score ? 'var(--primary)' : 'none'}
                        stroke="var(--primary)" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>

                  {/* 评价内容 */}
                  <p style={{
                    color: 'var(--foreground)',
                    fontSize: '1rem',
                    lineHeight: 1.85,
                    marginBottom: '1.75rem',
                    fontStyle: 'italic',
                  }}>
                    {t.text}
                  </p>

                  {/* 底部金色分隔线 */}
                  <div style={{ height: 1, background: 'rgba(201,168,124,0.15)', marginBottom: '1.25rem' }} />

                  {/* 客户信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <InitialAvatar name={t.name} size={40} />
                    <div>
                      <div style={{ color: 'var(--foreground)', fontSize: '0.9375rem', fontWeight: 500 }}>{t.name}</div>
                      {t.service && (
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{t.service}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======== 联系我们 ======== */}
      <section style={{ background: 'var(--background-secondary)', padding: '6rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)', fontSize: '0.6875rem', letterSpacing: '0.3em' }}>CONTACT</span>
              <div style={{ width: '2rem', height: 1, background: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
              期待与您相遇
            </h2>
          </div>

          <div style={{
            maxWidth: '38rem',
            margin: '0 auto',
            padding: '3rem',
            background: 'var(--background-card)',
            border: '1px solid rgba(201,168,124,0.15)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* 顶部装饰线 */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', marginBottom: '2rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  ),
                  text: settings.business_hours,
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.45L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.45-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ),
                  text: settings.business_tel,
                  isLink: true,
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  ),
                  text: settings.business_addr,
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.icon}
                  {item.isLink ? (
                    <a href={`tel:${settings.business_tel.replace(/-/g, '')}`} style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                      {item.text}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--foreground)', fontSize: '1rem' }}>{item.text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* 底部装饰线 */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', marginTop: '2rem' }} />
          </div>
        </div>
      </section>

    </div>
  );
}
