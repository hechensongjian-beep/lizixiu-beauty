'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  imageColor: string;
  imageUrl?: string;
  tags: string[];
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
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    document.title = '护肤产品商城 - 丽姿秀';
    getProducts()
      .then(data => {
        setProducts(data?.products || []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError('加载失败，请刷新页面'); });

    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    const current = cart[productId] || 0;
    if (current >= product.stock) return;
    setCart(prev => ({ ...prev, [productId]: current + 1 }));
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1500);
    setToast(product.name + ' 已加入购物车');
    setTimeout(() => setToast(''), 2000);
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
  const getCartTotal = () =>
    Object.entries(cart).reduce((t, [id, qty]) => {
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-2xl mb-6 animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded-xl mx-auto mb-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white border rounded-2xl p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-6"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#c9a87c] text-white rounded-xl hover:bg-[#a88a5c] transition">刷新页面</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页面头部 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{background:'linear-gradient(135deg, #c9a87c22 0%, #e8d5b822 100%)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>产品商店</h1>
        <p style={{color:'#6b6b68'}}>精选美容护肤产品，专业级护理体验</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="搜索产品..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 text-sm outline-none transition"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'white',color:'#2a2a28'}}
            onFocus={e => (e.target.style.borderColor = '#c9a87c')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,124,0.3)')} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'#9b9b98'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button onClick={() => setFilter('all')}
          className="px-5 py-2.5 rounded-full font-medium transition"
          style={filter === 'all'
            ? {background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',color:'white',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}
            : {background:'white',border:'1.5px solid #e8e4df',color:'#2a2a28'}}>
          全部商品
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-5 py-2.5 rounded-full font-medium transition"
            style={filter === cat
              ? {background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',color:'white',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}
              : {background:'white',border:'1.5px solid #e8e4df',color:'#2a2a28'}}>
            {cat}
          </button>
        ))}
      </div>

      {/* 产品网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{color:'#9b9b98'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-xl mb-2">{search || filter !== 'all' ? '未找到相关商品' : '暂无商品'}</p>
          <p className="text-sm">{search || filter !== 'all' ? '试试其他关键词或分类' : '商家正在准备中，敬请期待'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-4 px-6 py-2 rounded-lg text-sm font-medium text-white" style={{background:'var(--primary)'}}>
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {filtered.map(product => {
            const qty = cart[product.id] || 0;
            const justAdded = addedId === product.id;
            return (
              <div key={product.id}
                className="bg-white rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer"
                style={{border:'1px solid rgba(201,168,124,0.15)',boxShadow:'0 4px 20px rgba(0,0,0,0.04)'}}
                onClick={() => router.push(`/product?id=${product.id}`)}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)')}>
                {/* 产品图 */}
                <div className={`w-full h-44 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden ${product.imageUrl ? '' : 'bg-gradient-to-br from-[#e8d5b8] to-[#c9a87c]'}`}
                  onClick={e => { e.stopPropagation(); router.push(`/product?id=${product.id}`); }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <div className="text-white text-5xl font-bold opacity-80 mb-2" style={{fontFamily:"'Noto Serif SC',serif"}}>{product.name.charAt(0)}</div>
                      <div className="text-white text-xs opacity-70">{product.name}</div>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">已售罄</span>
                    </div>
                  )}
                </div>

                {/* 标签 */}
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{background:'#faf8f5',color:'#a88a5c'}}>{tag}</span>
                    ))}
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2" style={{color:'#2a2a28'}}>{product.name}</h3>
                <p className="text-base mb-4 line-clamp-2" style={{color:'#6b6b68'}}>{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold" style={{color:'#a88a5c'}}>{fmt(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm line-through ml-2" style={{color:'#9b9b98'}}>{fmt(product.originalPrice)}</span>
                    )}
                  </div>
                  <span className="text-sm" style={{color: product.stock > 0 ? '#9caf88' : '#e05c5c'}}>
                    {product.stock > 0 ? `库存 ${product.stock}` : '售罄'}
                  </span>
                </div>

                {product.stock === 0 ? (
                  <div className="w-full py-3 text-center rounded-xl font-bold cursor-not-allowed" style={{background:'#f5f2ed',color:'#9b9b98'}}>已售罄</div>
                ) : qty === 0 ? (
                  <button onClick={() => addToCart(product.id)}
                    className="w-full py-3 rounded-xl font-bold text-white transition"
                    style={{background: justAdded ? '#2d4a3e' : 'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)'}}>
                    {justAdded ? '已加入' : '+ 加入购物车'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(product.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-lg transition" style={{background:'#f5f2ed',color:'#2a2a28'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#e8e4df'}
                      onMouseLeave={e=>e.currentTarget.style.background='#f5f2ed'}>−</button>
                    <div className="flex-1 py-3 text-center rounded-xl font-bold text-lg text-white" style={{background:'#2d4a3e'}}>{qty}</div>
                    <button onClick={() => addToCart(product.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-lg text-white transition"
                      style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 促销横幅 */}
      <div className="rounded-2xl p-8 text-center mb-12" style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',color:'white'}}>
        <h3 className="text-2xl font-bold mb-3" style={{fontFamily:"'Noto Serif SC',serif"}}>限时优惠</h3>
        <p className="text-lg mb-5 opacity-90">全场满 500 元免运费，新用户首单立减 30 元</p>
        <Link href="/cart" className="inline-block px-8 py-3 rounded-lg font-bold transition hover:opacity-90" style={{background:'white',color:'#a88a5c'}}>
          立即去购物车结算 →
        </Link>
      </div>

      {/* 返回 */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center px-6 py-3 rounded-lg font-bold transition" style={{border:'1.5px solid #c9a87c',color:'#a88a5c'}}>
          ← 返回主页
        </Link>
      </div>

      {/* 悬浮购物车 */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-5 max-w-xs z-40" style={{boxShadow:'0 20px 60px rgba(0,0,0,0.12)',border:'1px solid rgba(201,168,124,0.15)'}}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold" style={{color:'#2a2a28'}}>购物车 ({getCartCount()}件)</span>
            <Link href="/cart" className="text-sm font-medium" style={{color:'#a88a5c'}}>去结算 →</Link>
          </div>
          <div className="text-2xl font-bold mb-3" style={{color:'#2a2a28'}}>¥{getCartTotal().toFixed(2)}</div>
          <div className="flex gap-3">
            <button onClick={() => setCart({})} className="flex-1 py-2.5 rounded-xl font-medium text-sm transition" style={{border:'1.5px solid #e8e4df',color:'#6b6b68'}}
              onMouseEnter={e=>e.currentTarget.style.background='#f5f2ed'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>清空</button>
            <Link href="/cart" className="flex-1 py-2.5 text-center rounded-xl font-bold text-sm text-white transition" style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)'}}>去结算</Link>
          </div>
        </div>
      )}
    </div>
  );
}

