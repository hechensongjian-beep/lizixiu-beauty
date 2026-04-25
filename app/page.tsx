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

// 首字母占位组件
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

// 产品图片组件 - 带优雅回退
function ProductImage({ product, size = 200 }: { product: Product; size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !product.imageUrl) {
    return (
      <div
        className="initial-placeholder"
        style={{
          width: '100%',
          height: size,
          fontSize: size * 0.25,
          borderRadius: 'var(--radius-lg)',
        }}
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
      style={{
        width: '100%',
        height: size,
        objectFit: 'cover',
        borderRadius: 'var(--radius-lg)',
      }}
    />
  );
}

// 装饰线组件
function GoldLine({ width = 48, className = '' }: { width?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width,
        height: 1,
        background: 'var(--primary)',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

// 品牌图标 SVG 组件
function HerbLeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
      <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
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
          getProducts(),
          getServices(),
          getTestimonials(),
          getPromotions(),
        ]);
        setProducts(pData.slice(0, 6));
        setServices(sData.slice(0, 6));
        setTestimonials(tData.slice(0, 3));
        setPromotions(promData.filter((p: Promotion) => p.is_active));
      } catch (e) {
        console.error('加载失败', e);
      }

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

      {/* ==================== Hero区 - 暖象牙白高奢，无黑块 ==================== */}
      <section
        className="relative"
        style={{
          background: 'var(--background)',
          paddingTop: '6rem',
          paddingBottom: '5rem',
          overflow: 'hidden',
        }}
      >
        {/* 顶部金色装饰 - 居中精致细线 */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              opacity: 0.6,
            }}
          >
            <GoldLine width={60} />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--primary)',
              }}
            />
            <GoldLine width={60} />
          </div>
        </div>

        {/* 副标题 - 金色小字 */}
        <p
          style={{
            textAlign: 'center',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {settings.hero_subtitle}
        </p>

        {/* 主标题 - 衬线大字，暖深色 */}
        <h1
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
            fontWeight: 400,
            color: 'var(--foreground)',
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            letterSpacing: '0.04em',
          }}
        >
          {heroTitle.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h1>

        {/* 描述 */}
        <p
          style={{
            textAlign: 'center',
            color: 'var(--foreground-muted)',
            fontSize: '1rem',
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.8,
          }}
        >
          {settings.hero_desc}
        </p>

        {/* 按钮 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <Link
              href="/appointments"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 2rem',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                boxShadow: '0 4px 20px rgba(201,168,124,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              立即预约
            </Link>
            <Link
              href="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 2rem',
                background: 'transparent',
                color: 'var(--primary-dark)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
              }}
            >
              浏览服务
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* 促销活动提示 */}
        {activePromo && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              background: 'rgba(201,168,124,0.1)',
              border: '1px solid rgba(201,168,124,0.25)',
              marginLeft: '50%',
              transform: 'translateX(-50%)',
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

        {/* 底部金色分隔线 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          }}
        />
      </section>

      {/* ==================== 品牌承诺 - 统一象牙白背景 ==================== */}
      <section style={{ background: 'var(--background)', padding: '5rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* 标题 */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              BRAND PROMISE
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
              为什么选择丽姿秀
            </h2>
          </div>

          {/* 三列承诺 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
            {/* 东方草本 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  border: '1px solid rgba(201,168,124,0.3)',
                  marginBottom: '1.25rem',
                  background: 'rgba(201,168,124,0.05)',
                }}
              >
                <HerbLeafIcon />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                东方草本
              </h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                甄选天然草本精华，温和养护每一寸肌肤
              </p>
            </div>

            {/* 现代科技 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  border: '1px solid rgba(201,168,124,0.3)',
                  marginBottom: '1.25rem',
                  background: 'rgba(201,168,124,0.05)',
                }}
              >
                <SparkleIcon />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                现代科技
              </h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                结合先进美容仪器，精准高效护理
              </p>
            </div>

            {/* 专属定制 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  border: '1px solid rgba(201,168,124,0.3)',
                  marginBottom: '1.25rem',
                  background: 'rgba(201,168,124,0.05)',
                }}
              >
                <HeartIcon />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                专属定制
              </h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                一对一诊断方案，量身打造护理计划
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 服务项目 ==================== */}
      <section style={{ background: 'var(--background)', padding: '5rem 0', borderTop: '1px solid rgba(201,168,124,0.1)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                SERVICES
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
                专业服务
              </h2>
            </div>
            <Link
              href="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--primary-dark)',
                fontSize: '0.875rem',
                transition: 'color 0.2s',
              }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {services.map(service => (
                <Link
                  key={service.id}
                  href="/appointments"
                  style={{
                    display: 'block',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.15)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  {service.category && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginBottom: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: 'rgba(201,168,124,0.1)',
                        color: 'var(--primary-dark)',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {service.category}
                    </span>
                  )}

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.125rem',
                      color: 'var(--foreground)',
                      marginBottom: '0.5rem',
                      transition: 'color 0.2s',
                    }}
                  >
                    {service.name}
                  </h3>

                  {service.description && (
                    <p
                      style={{
                        color: 'var(--foreground-muted)',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {service.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 600 }}>
                      {fmtCurrency(service.price)}
                    </span>
                    {service.duration && (
                      <span style={{ color: 'var(--foreground-light)', fontSize: '0.75rem' }}>
                        {service.duration}分钟
                      </span>
                    )}
                  </div>

                  {/* 底部金色细线 */}
                  <div
                    style={{
                      marginTop: '1rem',
                      height: 1,
                      background: 'rgba(201,168,124,0.2)',
                    }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== 精选产品 ==================== */}
      <section style={{ background: 'var(--background)', padding: '5rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                PRODUCTS
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
                精选产品
              </h2>
            </div>
            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--primary-dark)',
                fontSize: '0.875rem',
              }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  style={{
                    display: 'block',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.12)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  {/* 产品图片 */}
                  <div style={{ padding: '1rem' }}>
                    <ProductImage product={product} size={180} />
                  </div>

                  {/* 产品信息 */}
                  <div style={{ padding: '0 1.25rem 1.25rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        marginBottom: '0.5rem',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '999px',
                        background: 'rgba(201,168,124,0.08)',
                        color: 'var(--primary-dark)',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {product.category}
                    </span>

                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1rem',
                        color: 'var(--foreground)',
                        marginBottom: '0.375rem',
                        transition: 'color 0.2s',
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        color: 'var(--foreground-muted)',
                        fontSize: '0.75rem',
                        lineHeight: 1.6,
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 600 }}>
                        {fmtCurrency(product.price)}
                      </span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span style={{ color: '#c49393', fontSize: '0.6875rem' }}>
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

      {/* ==================== 客户口碑 ==================== */}
      {testimonials.length > 0 && (
        <section style={{ background: 'var(--background)', padding: '5rem 0', borderTop: '1px solid rgba(201,168,124,0.1)' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
                TESTIMONIALS
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
                客户心声
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {testimonials.map(t => (
                <div
                  key={t.id}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.12)',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  {/* 评分 */}
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={i < t.score ? 'var(--primary)' : 'none'}
                        stroke="var(--primary)"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>

                  {/* 评价内容 */}
                  <p
                    style={{
                      color: 'var(--foreground)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      marginBottom: '1.25rem',
                    }}
                  >
                    "{t.text}"
                  </p>

                  {/* 客户信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <InitialAvatar name={t.name} size={36} />
                    <div>
                      <div style={{ color: 'var(--foreground)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {t.name}
                      </div>
                      {t.service && (
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                          {t.service}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 联系我们 ==================== */}
      <section style={{ background: 'var(--background)', padding: '5rem 0', borderTop: '1px solid rgba(201,168,124,0.1)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              CONTACT
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
              联系我们
            </h2>
          </div>

          <div
            style={{
              maxWidth: '36rem',
              margin: '0 auto',
              padding: '2.5rem',
              background: 'var(--background-card)',
              border: '1px solid rgba(201,168,124,0.15)',
              borderRadius: 'var(--radius-2xl)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* 顶部装饰线 */}
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                marginBottom: '1.5rem',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ color: 'var(--foreground)', fontSize: '0.9375rem' }}>
                  {settings.business_hours}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.45L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.45-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a
                  href={`tel:${settings.business_tel.replace(/-/g, '')}`}
                  style={{ color: 'var(--primary)', fontSize: '0.9375rem' }}
                >
                  {settings.business_tel}
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                  {settings.business_addr}
                </span>
              </div>
            </div>

            {/* 底部装饰线 */}
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                marginTop: '1.5rem',
              }}
            />
          </div>
        </div>
      </section>

    </div>
  );
}
