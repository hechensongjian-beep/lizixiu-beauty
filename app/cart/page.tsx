'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api';

interface Product {
  id: string; name: string; description: string; price: number;
  originalPrice?: number; category: string; stock: number;
  imageColor: string; imageUrl?: string;
}

export default function CartPage() {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(data => {
        if (data?.products) {
          const m: Record<string, Product> = {};
          data.products.forEach((p: Product) => { m[p.id] = p; });
          setProducts(m);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) { try { setCart(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('beauty-shop-cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const nc = { ...prev };
      const q = (nc[productId] || 0) + delta;
      if (q <= 0) delete nc[productId];
      else nc[productId] = q;
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
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.06;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">购物车</h1>
        <p className="text-gray-600">请核对您的商品，确认无误后进行结算。</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a87c]"></div></div>
      ) : cartItems.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-16 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c0bdb8" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="mx-auto mb-6"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">购物车是空的</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">您还没有添加任何商品。去产品商店逛逛吧！</p>
          <Link href="/products" className="inline-flex items-center px-8 py-4 font-bold text-lg rounded-lg text-white transition" style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}>去产品商店</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">购物车商品 ({cartItems.length})</h2>
                <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium">清空购物车</button>
              </div>
              <div className="space-y-6">
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} className="flex flex-col md:flex-row items-start md:items-center border-b border-gray-100 pb-6 last:border-0">
                    <div className={`w-24 h-24 bg-gradient-to-r ${product.imageColor} rounded-xl mb-4 md:mb-0 md:mr-6 flex items-center justify-center flex-shrink-0`}>
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" opacity="0.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                          <div className="mt-2 text-sm text-gray-500">分类：{product.category} · 库存：{product.stock} 件</div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900">{fmt(product.price)}</div>
                          {product.originalPrice && <div className="text-sm text-gray-500 line-through">{fmt(product.originalPrice)}</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center">
                          <button onClick={() => updateQuantity(product.id, -1)} className="w-10 h-10 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition">–</button>
                          <div className="mx-4 text-xl font-bold text-gray-900">{qty} 件</div>
                          <button onClick={() => updateQuantity(product.id, 1)} className="w-10 h-10 font-bold rounded-lg text-white transition" style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)'}}>+</button>
                          <button onClick={() => removeItem(product.id)} className="ml-6 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition">删除</button>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{fmt(product.price * qty)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/products" className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition">← 继续购物</Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">订单摘要</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-700">商品小计</span><span className="font-medium">{fmt(subtotal)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-700">运费</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? '免费' : fmt(shipping)}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-700">增值税 (6%)</span><span className="font-medium">{fmt(tax)}</span></div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900"><span>总计</span><span>{fmt(total)}</span></div>
                </div>
              </div>
              {subtotal < 500 && (
                <div className="mt-6 p-4 rounded-lg" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.2)'}}>
                  <div className="text-amber-800 font-medium mb-1">🎉 还差 {fmt(500 - subtotal)} 即可免运费！</div>
                </div>
              )}
              <Link href="/checkout" className="block w-full mt-8 py-4 text-center font-bold text-lg rounded-lg text-white transition" style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}>去结算</Link>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2"><span className="mr-2">🔒</span><span>SSL 加密支付</span></div>
                <div className="flex items-center text-sm text-gray-600"><span className="mr-2">↩️</span><span>7 天无忧退换</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mt-12">
        <Link href="/" className="inline-flex items-center px-6 py-3 font-semibold rounded-lg transition" style={{"background":'#2d4a3e',"color":'white'}}>← 返回主页</Link>
      </div>
    </div>
  );
}
