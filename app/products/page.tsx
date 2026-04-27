'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api';

interface Product {
  id: string; name: string; description: string; price: number; originalPrice?: number;
  category: string; stock: number; imageColor: string; imageUrl?: string; tags: string[];
}

const CART_KEY = 'beauty-shop-cart';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = '护肤产品 - 丽姿秀';
    getProducts()
      .then(data => { setProducts(data?.products || []); setLoading(false); })
      .catch(() => { setLoading(false); setError('加载失败，请刷新页面'); });
    const saved = localStorage.getItem(CART_KEY);
    if (saved) { try { setCart(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    const current = cart[productId] || 0;
    if (current >= product.stock) return;
    setCart(prev => ({ ...prev, [productId]: current + 1 }));
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1500);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) updated[productId] -= 1;
      else delete updated[productId];
      return updated;
    });
  };

  const getCartCount = () => Object.values(cart).reduce((s, q) => s + q, 0);
  const getCartTotal = () => Object.entries(cart).reduce((t, [id, qty]) => {
    const p = products.find(p => p.id === id);
    return t + (p ? p.price * qty : 0);
  }, 0);

  const filtered = products.filter(p => {
    const matchCat = filter === 'all' || p.category === filter;
    const matchSearch = !search || p.name.includes(search) || p.description.includes(search);
    return matchCat && matchSearch;
  });
  const categories = Array.from(new Set(products.map(p => p.category)));
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="h-8 w-40 text-[var(--background-secondary)] rounded-lg mx-auto mb-3 animate-pulse" style={{ maxWidth: '200px' }}></div>
          <div className="h-4 w-56 text-[var(--background-card)] rounded mx-auto animate-pulse" style={{ maxWidth: '280px' }}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid var(--primary-light)' }}>
              <div className="w-full h-40 text-[var(--background-secondary)] rounded-lg mb-4"></div>
              <div className="h-4 w-3/4 text-[var(--background-secondary)] rounded mb-3"></div>
              <div className="h-3 w-full text-[var(--background-card)] rounded mb-2"></div>
              <div className="h-5 w-1/3 text-[var(--background-secondary)] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#fef2f2' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className="mb-3" style={{ color: '#ef4444', fontSize: '0.9375rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-md text-white transition" style={{ background: 'var(--primary)', fontSize: '0.8125rem' }}>刷新页面</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 页面头部 - 精致简洁 */}
      <div className="text-center mb-10">
        <div className="tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Products</div>
        <h1 style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '1.75rem' }}>精选护肤产品</h1>
      </div>

      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative max-w-sm mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="搜索产品..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none transition"
            style={{ borderColor: 'var(--primary-light)', background: 'white', color: 'var(--foreground)', fontSize: '0.8125rem' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--primary-light)')} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-light)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 - 更精致 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button onClick={() => setFilter('all')}
          className="px-4 py-1.5 rounded-full font-medium transition"
          style={filter === 'all'
            ? { background: 'var(--primary)', color: 'white', fontSize: '0.8125rem', boxShadow: '0 2px 8px rgba(201,168,124,0.25)' }
            : { background: 'white', border: '1px solid var(--primary-light)', color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
          全部
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-4 py-1.5 rounded-full font-medium transition"
            style={filter === cat
              ? { background: 'var(--primary)', color: 'white', fontSize: '0.8125rem', boxShadow: '0 2px 8px rgba(201,168,124,0.25)' }
              : { background: 'white', border: '1px solid var(--primary-light)', color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* 产品网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="mb-1" style={{ fontSize: '0.9375rem' }}>{search || filter !== 'all' ? '未找到相关商品' : '暂无商品'}</p>
          <p style={{ fontSize: '0.8125rem' }}>{search || filter !== 'all' ? '试试其他关键词或分类' : '商家正在准备中，敬请期待'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-3 px-4 py-1.5 rounded-md text-white" style={{ background: 'var(--primary)', fontSize: '0.8125rem' }}>清除筛选</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
          {filtered.map(product => {
            const qty = cart[product.id] || 0;
            const justAdded = addedId === product.id;
            return (
              <div key={product.id}
                className="bg-white rounded-xl overflow-hidden transition-all hover:shadow-md cursor-pointer group"
                style={{ border: '1px solid var(--primary-light)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                onClick={() => router.push(`/product?id=${product.id}`)}>
                {/* 产品图 */}
                <div className="relative h-44 overflow-hidden"
                  onClick={e => { e.stopPropagation(); router.push(`/product?id=${product.id}`); }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.06) 0%, rgba(232,213,184,0.08) 100%)' }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
                      <span style={{ color:'var(--primary)', fontFamily:"'Noto Serif SC', serif", fontSize:'2rem', fontWeight:400, opacity:0.7, letterSpacing:'0.05em' }}>{product.name.charAt(0)}</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-medium" style={{ fontSize: '0.875rem' }}>已售罄</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {/* 标签 */}
                  {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.6875rem' }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <h3 className="font-bold mb-1.5" style={{ color: 'var(--foreground)', fontSize: '0.9375rem' }}>{product.name}</h3>
                  <p className="mb-3 line-clamp-2" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', lineHeight: '1.5' }}>{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '1rem' }}>{fmt(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="line-through ml-1.5" style={{ color: 'var(--foreground-light)', fontSize: '0.6875rem' }}>{fmt(product.originalPrice)}</span>
                      )}
                    </div>
                    <span style={{ color: product.stock > 0 ? 'var(--sage)' : '#e05c5c', fontSize: '0.6875rem' }}>
                      {product.stock > 0 ? `库存 ${product.stock}` : '售罄'}
                    </span>
                  </div>

                  {product.stock === 0 ? (
                    <div className="w-full py-2 text-center rounded-md" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-light)', fontSize: '0.8125rem' }}>已售罄</div>
                  ) : qty === 0 ? (
                    <button onClick={e => { e.stopPropagation(); addToCart(product.id); }}
                      className="w-full py-2 rounded-md text-white transition"
                      style={{ background: justAdded ? 'var(--accent)' : 'var(--primary)', fontSize: '0.8125rem', fontWeight: 500 }}>
                      {justAdded ? '已加入' : '加入购物车'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); removeFromCart(product.id); }}
                        className="flex-1 py-2 rounded-md font-medium transition" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', fontSize: '0.875rem' }}>−</button>
                      <div className="flex-1 py-2 text-center rounded-md text-white font-medium" style={{ background: 'var(--accent)', fontSize: '0.875rem' }}>{qty}</div>
                      <button onClick={e => { e.stopPropagation(); addToCart(product.id); }}
                        className="flex-1 py-2 rounded-md text-white font-medium transition" style={{ background: 'var(--primary)', fontSize: '0.875rem' }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 促销横幅 */}
      <div className="rounded-xl p-6 text-center mb-10" style={{ background: 'var(--accent)' }}>
        <h3 className="text-white mb-2" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.25rem' }}>限时优惠</h3>
        <p className="text-white/70 mb-4" style={{ fontSize: '0.8125rem' }}>全场满 500 元免运费，新用户首单立减 30 元</p>
        <Link href="/cart" className="inline-block px-6 py-2 rounded-md font-medium transition" style={{ background: 'var(--accent)', color: 'white', fontSize: '0.8125rem' }}>
          去购物车结算 →
        </Link>
      </div>

      {/* 悬浮购物车 */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl p-4 max-w-xs z-40" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid var(--primary-light)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.8125rem' }}>购物车 ({getCartCount()}件)</span>
            <Link href="/cart" className="font-medium" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>去结算 →</Link>
          </div>
          <div className="font-bold mb-2" style={{ color: 'var(--foreground)', fontSize: '1.0625rem' }}>¥{getCartTotal().toFixed(2)}</div>
          <div className="flex gap-2">
            <button onClick={() => setCart({})} className="flex-1 py-2 rounded-md transition" style={{ border: '1px solid var(--primary-light)', color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>清空</button>
            <Link href="/cart" className="flex-1 py-2 text-center rounded-md text-white" style={{ background: 'var(--primary-dark)', fontSize: '0.75rem' }}>去结算</Link>
          </div>
        </div>
      )}
    </div>
  );
}
