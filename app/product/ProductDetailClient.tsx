'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getServices } from '@/lib/api';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: string; name: string; description: string; price: number; originalPrice?: number;
  category: string; stock: number; imageColor: string; imageUrl?: string; tags: string[];
}

function ProductDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    import('@/lib/api').then(({ getProducts }) => {
      getProducts().then(data => {
        const list: Product[] = data?.products || [];
        const found = list.find(p => p.id === id) || null;
        setProduct(found);
        if (found) {
          setRelated(list.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [id]);

  useEffect(() => {
    getServices().then(svc => {
      setServices((svc?.services || []).slice(0, 3));
    });
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="rounded-xl bg-gray-100 animate-pulse" style={{ minHeight: '400px' }}></div>
          <div className="space-y-3">
            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-3 w-full bg-gray-50 rounded animate-pulse"></div>
            <div className="h-3 w-5/6 bg-gray-50 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ background: 'var(--background)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h1 className="font-bold mt-4 mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif", fontSize: '1.5rem' }}>商品不存在</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>该商品可能已下架或链接有误</p>
        <a href="/products" className="mt-6 px-6 py-2 rounded-md text-white font-medium transition" style={{ background: 'var(--primary)', fontSize: '0.8125rem' }}>返回产品列表</a>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* 顶部导航 */}
      <div className="bg-white sticky top-0 z-20" style={{ borderBottom: '1px solid var(--primary-light)' }}>
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/products" className="flex items-center gap-1.5 font-medium transition" style={{ color: 'var(--primary)', fontSize: '0.8125rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            产品列表
          </Link>
          <Link href="/cart" className="relative font-medium transition" style={{ color: 'var(--primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 mb-6" style={{ color: 'var(--foreground-light)', fontSize: '0.75rem' }}>
          <Link href="/" className="hover:underline">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">产品</Link>
          <span>/</span>
          <span style={{ color: 'var(--foreground)' }}>{product.name}</span>
        </div>

        {/* 主内容 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          {/* 左侧图片 */}
          <div>
            <div className={`rounded-xl overflow-hidden relative ${!product.imageUrl ? '' : ''}`} style={{ minHeight: '420px', background: product.imageUrl ? 'white' : 'linear-gradient(135deg, var(--primary-light), var(--primary))' }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" style={{ minHeight: '420px' }} loading="lazy" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '420px' }}>
                  <span className="text-white font-bold opacity-80" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '4rem' }}>{product.name.charAt(0)}</span>
                  <span className="text-white mt-2 opacity-70" style={{ fontSize: '0.875rem' }}>{product.name}</span>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium px-5 py-2 rounded-md" style={{ background: 'rgba(0,0,0,0.3)', fontSize: '0.875rem' }}>已售罄</span>
                </div>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-white font-medium" style={{ background: '#e05c5c', fontSize: '0.6875rem' }}>
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* 服务承诺 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: '正品保障' },
                { icon: 'M1 3h15v13H1zM16 8l4 3-4 3', text: '满500免运费' },
                { icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', text: '7天无理由' },
              ].map(item => (
                <div key={item.text} className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-white" style={{ border: '1px solid var(--primary-light)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                  <span style={{ color: 'var(--foreground-muted)', fontSize: '0.6875rem' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.6875rem' }}>
                {product.category}
              </span>
              {product.tags?.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.625rem' }}>{tag}</span>
              ))}
            </div>

            <h1 className="font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif", fontSize: '1.5rem' }}>{product.name}</h1>
            <p className="mb-5 leading-relaxed" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{product.description}</p>

            {/* 价格 */}
            <div className="p-4 rounded-lg mb-5" style={{ background: 'var(--primary-ultra-light)', border: '1px solid var(--primary-light)' }}>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{fmt(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="line-through" style={{ color: 'var(--foreground-light)', fontSize: '0.875rem' }}>{fmt(product.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-3" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                <span>{product.stock > 0 ? `库存 ${product.stock} 件` : '已售罄'}</span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span style={{ color: '#e05c5c', fontWeight: 500 }}>仅剩 {product.stock} 件</span>
                )}
              </div>
            </div>

            {/* 配送说明 */}
            <div className="mb-6 space-y-1.5" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>快递配送：满 500 元免运费，不足收 15 元</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                <span>到店自取：免费，请提前预约</span>
              </div>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>

        {/* 搭配服务推荐 */}
        {services.length > 0 && (
          <div className="pt-8 mb-8" style={{ borderTop: '1px solid var(--primary-light)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-0.5 h-4 rounded-full" style={{ background: 'var(--primary)' }}></div>
              <h2 className="font-bold" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif", fontSize: '1rem' }}>搭配服务推荐</h2>
            </div>
            <div className="space-y-2">
              {services.map(svc => (
                <Link key={svc.id} href={`/appointments?service=${svc.id}`}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 group transition hover:shadow-sm"
                  style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', fontSize: '0.75rem' }}>
                      {svc.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.8125rem' }}>{svc.name}</div>
                      {svc.duration && <div style={{ color: 'var(--foreground-light)', fontSize: '0.6875rem' }}>{svc.duration} 分钟</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{fmt(svc.price)}</span>
                    <span className="px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--primary)', fontSize: '0.625rem' }}>预约</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div className="pt-8" style={{ borderTop: '1px solid var(--primary-light)' }}>
            <h2 className="font-bold mb-6" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif", fontSize: '1.125rem' }}>同类推荐</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="bg-white rounded-xl overflow-hidden transition hover:shadow-md"
                  style={{ border: '1px solid var(--primary-light)' }}>
                  <div className="w-full h-28 flex items-center justify-center" style={{ background: p.imageUrl ? 'white' : 'linear-gradient(135deg, var(--primary-light), var(--primary))' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold opacity-80" style={{ fontSize: '1.5rem' }}>{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate mb-1" style={{ color: 'var(--foreground)', fontSize: '0.8125rem' }}>{p.name}</h3>
                    <div className="font-bold" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{fmt(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>加载中...</p>
        </div>
      </div>
    }>
      <ProductDetailInner />
    </Suspense>
  );
}
