'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl mb-6">
          <div className="text-3xl">🛒</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">购物车</h1>
        <p className="text-gray-600">请核对您的商品，确认无误后进行结算。</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
      ) : cartItems.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-16 text-center">
          <div className="text-6xl mb-6">😢</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">购物车是空的</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">您还没有添加任何商品。去产品商店逛逛吧！</p>
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition">🛍️ 去产品商店</Link>
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
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <div className="text-2xl">✨</div>}
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
                          <button onClick={() => updateQuantity(product.id, 1)} className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition">+</button>
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
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <div className="text-amber-800 font-medium mb-1">🎉 还差 {fmt(500 - subtotal)} 即可免运费！</div>
                </div>
              )}
              <Link href="/checkout" className="block w-full mt-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition text-center">去结算</Link>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2"><span className="mr-2">🔒</span><span>SSL 加密支付</span></div>
                <div className="flex items-center text-sm text-gray-600"><span className="mr-2">↩️</span><span>7 天无忧退换</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mt-12">
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition">← 返回主页</Link>
      </div>
    </div>
  );
}
