'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  imageColor: string; // 用于占位背景色
  tags: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('加载产品失败', err);
        setLoading(false);
      });
  }, []);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    // 检查库存
    const currentInCart = cart[productId] || 0;
    if (currentInCart >= product.stock) {
      alert(`库存不足，仅剩 ${product.stock} 件`);
      return;
    }
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  const filteredProducts =
    filter === 'all'
      ? products
      : products.filter(p => p.category === filter);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        {/* 头部骨架 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-300 rounded-2xl mb-6"></div>
          <div className="h-12 w-64 bg-gray-300 rounded-xl mx-auto mb-4"></div>
          <div className="h-6 w-96 bg-gray-300 rounded mx-auto"></div>
        </div>

        {/* 分类筛选骨架 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-24 bg-gray-300 rounded-lg"></div>
          ))}
        </div>

        {/* 产品网格骨架 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="w-full h-48 bg-gray-300 rounded-xl mb-6"></div>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-24 bg-gray-300 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-full bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* 促销横幅骨架 */}
        <div className="bg-gray-300 rounded-2xl p-8 mb-12"></div>

        {/* 页脚骨架 */}
        <div className="text-center">
          <div className="inline-block h-12 w-40 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页面头部 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl mb-6">
          <div className="text-3xl">🛍️</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">产品商店</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          精选美容护肤产品，为您带来专业级护理体验。
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-lg font-medium transition ${filter === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'
            }`}
        >
          全部商品
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-lg font-medium transition ${filter === cat
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 产品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
          >
            {/* 产品图片占位 */}
            <div
              className={`w-full h-48 ${product.imageColor} rounded-xl mb-6 flex items-center justify-center`}
            >
              <div className="text-4xl">✨</div>
            </div>

            {/* 标签 */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                库存：{product.stock} 件
              </div>
            </div>

            <button
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
              className={`w-full py-3 font-bold rounded-lg transition ${product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90'
                }`}
            >
              {product.stock === 0 ? '已售罄' : '加入购物车'}
            </button>
          </div>
        ))}
      </div>

      {/* 购物车浮动栏 */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-8 right-8 bg-white border border-gray-300 rounded-2xl p-6 shadow-2xl max-w-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">购物车摘要</h3>
          <div className="space-y-3 mb-6">
            {Object.entries(cart).map(([productId, qty]) => {
              const product = products.find(p => p.id === productId);
              if (!product) return null;
              return (
                <div key={productId} className="flex justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{qty} 件 × {formatCurrency(product.price)}</div>
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(product.price * qty)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 mb-6">
            <span className="text-lg font-bold text-gray-900">总计</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(getCartTotal())}
            </span>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setCart({})}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
            >
              清空
            </button>
            <Link
              href="/cart"
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition text-center"
            >
              去结算
            </Link>
          </div>
        </div>
      )}

      {/* 促销横幅 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 mb-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">🎉 限时优惠</h3>
          <p className="text-lg mb-6">
            全场满 500 元免运费，新用户首单立减 30 元！
          </p>
          <button className="px-8 py-3 bg-white text-pink-700 font-bold rounded-lg hover:opacity-90 transition">
            查看活动详情
          </button>
        </div>
      </div>

      {/* 页脚导航 */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
        >
          ← 返回主页
        </Link>
      </div>
    </div>
  );
}