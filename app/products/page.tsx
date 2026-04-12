'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(data => {
        setProducts(data?.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

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

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页面头部 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl mb-6">
          <span className="text-3xl">🛍️</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">产品商店</h1>
        <p className="text-gray-600">精选美容护肤产品，专业级护理体验</p>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-full font-medium transition ${filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-pink-50'}`}>
          全部商品
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-full font-medium transition ${filter === cat ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-pink-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 产品网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-xl">暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {filtered.map(product => {
            const qty = cart[product.id] || 0;
            const justAdded = addedId === product.id;
            return (
              <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                {/* 产品图 */}
                <div className={`w-full h-44 rounded-xl mb-5 bg-gradient-to-br ${product.imageColor} flex items-center justify-center relative overflow-hidden`}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-4xl">✨</span>
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
                      <span key={tag} className="px-2.5 py-0.5 bg-pink-50 text-pink-600 text-xs font-medium rounded-full">{tag}</span>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-pink-600">{fmt(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through ml-2">{fmt(product.originalPrice)}</span>
                    )}
                  </div>
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock > 0 ? `库存 ${product.stock}` : '售罄'}
                  </span>
                </div>

                {product.stock === 0 ? (
                  <div className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-bold text-center cursor-not-allowed">已售罄</div>
                ) : qty === 0 ? (
                  <button onClick={() => addToCart(product.id)}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition shadow-md">
                    {justAdded ? '✓ 已加入' : '+ 加入购物车'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(product.id)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition text-lg">−</button>
                    <div className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold text-center text-lg">{qty}</div>
                    <button onClick={() => addToCart(product.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition text-lg"
                      disabled={qty >= product.stock}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 促销横幅 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
        <h3 className="text-2xl font-bold mb-3">🎉 限时优惠</h3>
        <p className="text-lg mb-5 opacity-90">全场满 500 元免运费，新用户首单立减 30 元</p>
        <Link href="/cart" className="inline-block px-8 py-3 bg-white text-pink-600 font-bold rounded-lg hover:bg-gray-100 transition">
          立即去购物车结算 →
        </Link>
      </div>

      {/* 返回 */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
          ← 返回主页
        </Link>
      </div>

      {/* 悬浮购物车 */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl max-w-xs z-40">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-900">🛒 购物车 ({getCartCount()}件)</span>
            <Link href="/cart" className="text-pink-600 text-sm font-medium hover:underline">去结算 →</Link>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-3">¥{getCartTotal().toFixed(2)}</div>
          <div className="flex gap-3">
            <button onClick={() => setCart({})} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50">清空</button>
            <Link href="/cart" className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm text-center hover:opacity-90 transition">去结算</Link>
          </div>
        </div>
      )}
    </div>
  );
}
