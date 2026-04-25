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
    // 无图片时显示优雅的首字母占位
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
    <div style={{ background: 'var(--background)' }}>
      {/* ==================== Hero区 - 深墨色高奢 ==================== */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #111110 0%, #1a1918 100%)',
          minHeight: '70vh',
          paddingTop: '4rem',
          paddingBottom: '5rem',
        }}
      >
        {/* 金色装饰线 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '60px',
            background: 'linear-gradient(180deg, transparent, var(--primary), transparent)',
          }}
        />
        
        {/* Unsplash氛围背景图 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1560756555555-ba600a4975a0?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* 副标题 - 金色小字 */}
          <p
            style={{
              color: 'var(--primary)',
              fontSize: '0.8125rem',
              letterSpacing: '0.2em',
              marginBottom: '1.5rem',
              fontWeight: 500,
            }}
          >
            {settings.hero_subtitle}
          </p>
          
          {/* 主标题 - 衬线大字 */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
              fontWeight: 400,
              color: 'var(--foreground-hero)',
              lineHeight: 1.25,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em',
            }}
          >
            {heroTitle.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          
          {/* 描述 */}
          <p
            style={{
              color: 'rgba(240,237,232,0.7)',
              fontSize: '1rem',
              maxWidth: '480px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.8,
            }}
          >
            {settings.hero_desc}
          </p>
          
          {/* 按钮 - 金色主按钮 + 金边次按钮 */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.9375rem',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 20px rgba(201,168,124,0.3)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              立即预约
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                border: '1.5px solid var(--primary)',
                fontSize: '0.9375rem',
                letterSpacing: '0.05em',
              }}
            >
              浏览服务
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          
          {/* 促销活动提示 */}
          {activePromo && (
            <div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(201,168,124,0.15)',
                border: '1px solid rgba(201,168,124,0.3)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{ color: 'var(--primary)', fontSize: '0.8125rem' }}>
                {activePromo.title} · {activePromo.discount_type === 'percentage' ? `${activePromo.discount_value}% OFF` : `立减¥${activePromo.discount_value}`}
              </span>
            </div>
          )}
        </div>
        
        {/* 底部金色装饰线 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.3), transparent)',
          }}
        />
      </section>

      {/* ==================== 品牌承诺 - 暖白背景 ==================== */}
      <section className="py-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              BRAND PROMISE
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
              为什么选择丽姿秀
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🌿', title: '东方草本', desc: '甄选天然草本精华，温和养护每一寸肌肤' },
              { icon: '✨', title: '现代科技', desc: '结合先进美容仪器，精准高效护理' },
              { icon: '💝', title: '专属定制', desc: '一对一诊断方案，量身打造护理计划' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className="inline-flex items-center justify-center mb-4"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-ultra-light) 100%)',
                    fontSize: '1.5rem',
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 服务项目 - 暖白背景纯白卡片 ==================== */}
      <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
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
              className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
              style={{ fontSize: '0.875rem' }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <Link
                  key={service.id}
                  href="/appointments"
                  className="card-product group"
                >
                  {/* 服务卡片 - 纯白底金边 */}
                  <div className="p-6">
                    {/* 分类标签 */}
                    {service.category && (
                      <span
                        className="inline-block mb-3 px-2.5 py-1 rounded"
                        style={{
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
                      className="mb-2 group-hover:text-[var(--primary)] transition-colors"
                      style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', color: 'var(--foreground)' }}
                    >
                      {service.name}
                    </h3>
                    
                    {service.description && (
                      <p
                        className="mb-4 line-clamp-2"
                        style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}
                      >
                        {service.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 600 }}>
                        {fmtCurrency(service.price)}
                      </span>
                      {service.duration && (
                        <span style={{ color: 'var(--foreground-light)', fontSize: '0.75rem' }}>
                          {service.duration}分钟
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 底部金色装饰线 */}
                  <div
                    className="h-px w-0 group-hover:w-full transition-all duration-300"
                    style={{ background: 'var(--primary)' }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== 精选产品 - 暖白背景纯白卡片 ==================== */}
      <section className="py-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
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
              className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
              style={{ fontSize: '0.875rem' }}
            >
              查看全部
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>加载中...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="card-product group"
                >
                  {/* 产品图片区 */}
                  <div className="p-4">
                    <ProductImage product={product} size={180} />
                  </div>
                  
                  {/* 产品信息 */}
                  <div className="px-5 pb-5">
                    {/* 分类标签 */}
                    <span
                      className="inline-block mb-2 px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(201,168,124,0.1)',
                        color: 'var(--primary-dark)',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {product.category}
                    </span>
                    
                    <h3
                      className="mb-1.5 group-hover:text-[var(--primary)] transition-colors"
                      style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--foreground)' }}
                    >
                      {product.name}
                    </h3>
                    
                    <p
                      className="mb-3 line-clamp-2"
                      style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}
                    >
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
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

      {/* ==================== 客户口碑 - 暖白背景 ==================== */}
      {testimonials.length > 0 && (
        <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
                TESTIMONIALS
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
                客户心声
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div
                  key={t.id}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'var(--background-card)',
                    border: '1px solid rgba(201,168,124,0.12)',
                  }}
                >
                  {/* 评分 */}
                  <div className="flex gap-0.5 mb-4">
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
                    className="mb-4"
                    style={{ color: 'var(--foreground)', fontSize: '0.875rem', lineHeight: 1.7, fontStyle: 'italic' }}
                  >
                    "{t.text}"
                  </p>
                  
                  {/* 客户信息 */}
                  <div className="flex items-center gap-3">
                    <InitialAvatar name={t.name} size={36} />
                    <div>
                      <div style={{ color: 'var(--foreground)', fontSize: '0.8125rem', fontWeight: 500 }}>
                        {t.name}
                      </div>
                      {t.service && (
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.6875rem' }}>
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

      {/* ==================== 联系我们 - 暖白背景 ==================== */}
      <section className="py-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              CONTACT
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
              联系我们
            </h2>
          </div>
          
          <div
            className="max-w-xl mx-auto p-8 rounded-2xl text-center"
            style={{
              background: 'var(--background-card)',
              border: '1px solid rgba(201,168,124,0.15)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* 装饰线 */}
            <div
              className="mb-6"
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              }}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ color: 'var(--foreground)', fontSize: '0.9375rem' }}>
                  {settings.business_hours}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.45L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.45-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a
                  href={`tel:${settings.business_tel.replace(/-/g, '')}`}
                  style={{ color: 'var(--primary)', fontSize: '0.9375rem' }}
                  className="hover:underline"
                >
                  {settings.business_tel}
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                  {settings.business_addr}
                </span>
              </div>
            </div>
            
            {/* 装饰线 */}
            <div
              className="mt-6"
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}