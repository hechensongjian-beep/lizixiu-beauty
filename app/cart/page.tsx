'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

interface Product {
  id: string; name: string; description: string; price: number;
  originalPrice?: number; category: string; stock: number;
  imageColor: string; imageUrl?: string;
}

export default async function CartPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 立即加载本地购物车（不依赖 API）
  useEffect(() => {
    document.title = '购物车 - 丽姿秀';
    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  // 加载产品数据（用于展示名称/价格/图片）
  useEffect(() => {
    if (!loading && !user) {
      toast.confirm('结算需要登录账号，是否前往登录？').then(confirmed => {
        if (confirmed) router.push('/auth/login?redirect=/cart');
      });
    }
  }, [loading, user, router]);

  useEffect(() => {
    getProducts()
      .then(data => {
        if (data?.products) {
          const m: Record<string, Product> = {};
          data.products.forEach((p: Product) => { m[p.id] = p; });
          setProducts(m);
          // 如果本地购物车有已删除商品，同步清理
          const saved = localStorage.getItem('beauty-shop-cart');
          if (saved) {
            try {
              const savedCart: Record<string, number> = JSON.parse(saved);
              const validCart: Record<string, number> = {};
              let hasInvalid = false;
              for (const [id, qty] of Object.entries(savedCart)) {
                if (m[id]) { validCart[id] = qty; }
                else { hasInvalid = true; }
              }
              if (hasInvalid) {
                const cleanCart = hasInvalid
                  ? Object.fromEntries(Object.entries(savedCart).filter(([id]) => !!m[id]))
                  : savedCart;
                setCart(cleanCart);
                localStorage.setItem('beauty-shop-cart', JSON.stringify(cleanCart));
              }
            } catch {}
          }
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError('加载失败'); });
  }, []);

  useEffect(() => {
    localStorage.setItem('beauty-shop-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  }, [cart]);

  const [stockWarnings, setStockWarnings] = useState<Record<string, boolean>>({});

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const nc = { ...prev };
      const q = (nc[productId] || 0) + delta;
      const product = products[productId];
      if (q <= 0) { delete nc[productId]; }
      else {
        nc[productId] = q;
        // 检查库存
        if (product && q > product.stock) {
          setStockWarnings(prev => ({ ...prev, [productId]: true }));
        } else {
          setStockWarnings(prev => { const nw = { ...prev }; delete nw[productId]; return nw; });
        }
      }
      return nc;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => { const nc = { ...prev }; delete nc[productId]; return nc; });
  };

  const clearCart = () => setCart({});
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => { const p = products[id]; return p ? { product: p, qty } : null; })
    .filter(Boolean) as { product: Product; qty: number }[];

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'pickup' | 'delivery'>('express');
  const freeDeliveryThreshold = 500;
  const shipping = deliveryMethod === 'pickup' || deliveryMethod === 'delivery' ? 0 : (subtotal >= freeDeliveryThreshold ? 0 : 15);
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h1 className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>购物车</h1>
        <p className="var(--foreground-muted)">请核对您的商品，确认无误后进行结算。</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a87c]"></div></div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 text-white rounded-xl transition hover:opacity-85" style={{background:'var(--primary)'}}>刷新页面</button>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-gradient-to-r from-[#faf8f5] to-[#f5f2ed] border rgba(201,168,124,0.2) rounded-xl p-10 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c0bdb8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <h3 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.375rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '1rem' }}>购物车是空的</h3>
          <p className="var(--foreground-muted) max-w-md mx-auto mb-8">您还没有添加任何商品。去产品商店逛逛吧！</p>
          <Link href="/products" className="inline-flex items-center px-5 py-2.5 font-medium rounded-md text-white transition hover:opacity-85" style={{background:'var(--primary)',boxShadow:'0 4px 15px rgba(201,168,124,0.35)'}}>去产品商店</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white border rgba(201,168,124,0.2) rounded-xl p-5 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold">购物车商品 ({cartItems.length})</h2>
                <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium">清空购物车</button>
              </div>
              <div className="space-y-6">
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} className="flex flex-col md:flex-row items-start md:items-center border-b border-gray-100 pb-6 last:border-0">
                    <div className={`w-24 h-24 bg-gradient-to-r ${product.imageColor} rounded-xl mb-4 md:mb-0 md:mr-6 flex items-center justify-center flex-shrink-0`}>
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" loading="lazy" /> : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-base var(--foreground-muted) mt-1">{product.description}</p>
                          <div className="mt-2 text-sm var(--foreground-muted)">分类：{product.category} · 库存：{product.stock} 件</div>
                          {stockWarnings[product.id] && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-red-600 font-medium">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              库存不足，当前仅剩 {product.stock} 件
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold">{fmt(product.price)}</div>
                          {product.originalPrice && <div className="text-sm var(--foreground-muted) line-through">{fmt(product.originalPrice)}</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center">
                          <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 var(--background-secondary) var(--foreground) font-medium rounded-md hover:var(--background-secondary) transition">-</button>
                          <div className="mx-4 font-bold">{qty} 件</div>
                          <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 font-medium rounded-md text-white transition hover:opacity-85" style={{background:'var(--primary)'}}>+</button>
                          <button onClick={() => removeItem(product.id)} className="ml-6 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition">删除</button>
                        </div>
                        <div className="font-bold">{fmt(product.price * qty)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/products" className="inline-flex items-center px-6 py-3 border-2 rgba(201,168,124,0.3) var(--foreground) font-bold rounded-lg hover:var(--background-card) transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="15 18 9 12 15 6"/></svg>
                  继续购物
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border rgba(201,168,124,0.2) rounded-xl p-5 shadow-lg">
              <h2 className="font-bold mb-6">订单摘要</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="var(--foreground)">商品小计</span><span className="font-medium">{fmt(subtotal)}</span></div>
                <div className="flex justify-between">
                  <span className="var(--foreground)">配送方式</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'express', label: '快递配送', desc: subtotal >= freeDeliveryThreshold ? '免费' : fmt(15) },
                    { key: 'pickup', label: '到店自取', desc: '免费' },
                    { key: 'delivery', label: '送货上门', desc: '镇内免费' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setDeliveryMethod(opt.key as any)}
                      className={`p-3 rounded-xl text-center transition border-2 ${deliveryMethod === opt.key ? 'border-[#c9a87c] bg-[#faf8f5]' : 'rgba(201,168,124,0.2) hover:border-[#c9a87c44]'}`}>
                      <div className="font-bold text-sm var(--foreground)">{opt.label}</div>
                      <div className="text-xs var(--foreground-muted) mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span className="var(--foreground)">运费</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? '免费' : fmt(shipping)}</span>
                </div>
                <div className="border-t rgba(201,168,124,0.2) pt-4">
                  <div className="flex justify-between font-bold"><span>总计</span><span>{fmt(total)}</span></div>
                </div>
              </div>
              {deliveryMethod !== 'pickup' && subtotal < freeDeliveryThreshold && (
                <div className="mt-6 p-4 rounded-lg" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.2)'}}>
                  <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    还差 {fmt(freeDeliveryThreshold - subtotal)} 即可免运费
                  </div>
                </div>
              )}
              <Link href="/checkout" onClick={() => localStorage.setItem('beauty-delivery-method', deliveryMethod)} className="block w-full mt-8 py-4 text-center font-medium rounded-md text-white transition hover:opacity-85" style={{background:'var(--accent)',boxShadow:'0 4px 15px rgba(45,74,62,0.2)'}}>去结算</Link>
              <div className="mt-8 pt-8 border-t rgba(201,168,124,0.2) space-y-3">
                <div className="flex items-center gap-2 text-sm var(--foreground-muted)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>SSL 加密支付</span>
                </div>
                <div className="flex items-center gap-2 text-sm var(--foreground-muted)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.36"/></svg>
                  <span>7 天无忧退换</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mt-12">
        <Link href="/" className="inline-flex items-center px-6 py-3 font-semibold rounded-lg transition hover:opacity-85" style={{background:'var(--accent)',color:'white'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="15 18 9 12 15 6"/></svg>
          返回主页
        </Link>
      </div>
    </div>
  );
}
