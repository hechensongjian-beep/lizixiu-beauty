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
  imageColor: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '玫瑰精油焕肤套装',
    description: '富含玫瑰精油与透明质酸，深层保湿，提亮肤色，适合干燥敏感肌。',
    price: 298,
    originalPrice: 398,
    category: '护肤品',
    stock: 24,
    imageColor: 'from-pink-300 to-rose-400',
  },
  {
    id: '2',
    name: '玻尿酸补水面膜（10片装）',
    description: '高浓度玻尿酸，15分钟快速补水，收缩毛孔，肌肤水润透亮。',
    price: 128,
    category: '面膜',
    stock: 56,
    imageColor: 'from-blue-300 to-cyan-400',
  },
  {
    id: '3',
    name: '茶树祛痘洁面乳',
    description: '茶树精油配方，温和清洁，控油祛痘，预防粉刺生成。',
    price: 88,
    category: '洁面',
    stock: 32,
    imageColor: 'from-green-300 to-emerald-400',
  },
  {
    id: '4',
    name: '维生素C精华液',
    description: '15%维生素C，抗氧化，淡化斑点，改善暗沉，提升肌肤光泽。',
    price: 256,
    originalPrice: 320,
    category: '精华',
    stock: 18,
    imageColor: 'from-amber-300 to-orange-400',
  },
  {
    id: '5',
    name: '防晒隔离霜 SPF50+',
    description: '高倍防晒，轻薄不油腻，提亮肤色，适合日常使用。',
    price: 158,
    category: '防晒',
    stock: 42,
    imageColor: 'from-purple-300 to-violet-400',
  },
  {
    id: '6',
    name: '颈纹修护霜',
    description: '专为颈部肌肤设计，淡化颈纹，紧致提升，恢复年轻状态。',
    price: 328,
    originalPrice: 428,
    category: '特殊护理',
    stock: 12,
    imageColor: 'from-red-300 to-pink-400',
  },
  {
    id: '7',
    name: '身体磨砂膏（玫瑰香）',
    description: '细腻磨砂颗粒，去除角质，滋润肌肤，留香持久。',
    price: 98,
    category: '身体护理',
    stock: 67,
    imageColor: 'from-pink-200 to-rose-300',
  },
  {
    id: '8',
    name: '护手霜礼盒（3支装）',
    description: '三种香型：玫瑰、茉莉、檀香，滋润不黏腻，呵护双手。',
    price: 168,
    originalPrice: 210,
    category: '手部护理',
    stock: 28,
    imageColor: 'from-yellow-300 to-amber-400',
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<Record<string, number>>({});

  // 模拟从 localStorage 加载购物车（实际项目应使用上下文或状态管理）
  useEffect(() => {
    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('解析购物车数据失败');
      }
    }
  }, []);

  // 保存购物车到 localStorage
  useEffect(() => {
    localStorage.setItem('beauty-shop-cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      const newQty = (newCart[productId] || 0) + delta;
      if (newQty <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      return newCart;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  // 计算总计
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = mockProducts.find(p => p.id === id);
      if (!product) return null;
      return { product, qty };
    })
    .filter(Boolean) as { product: Product; qty: number }[];

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.1; // 假设 10% 税
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页头 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl mb-6">
          <div className="text-3xl">🛒</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">购物车</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          请核对您的商品，确认无误后进行结算。
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-16 text-center">
          <div className="text-6xl mb-6">😢</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">购物车是空的</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            您还没有添加任何商品到购物车。去产品商店逛逛吧！
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
          >
            🛍️ 去产品商店
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 商品列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">购物车商品 ({cartItems.length})</h2>
              <div className="space-y-6">
                {cartItems.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="flex flex-col md:flex-row items-start md:items-center border-b border-gray-100 pb-6 last:border-0"
                  >
                    {/* 商品图片 */}
                    <div className={`w-24 h-24 bg-gradient-to-r ${product.imageColor} rounded-xl mb-4 md:mb-0 md:mr-6`}></div>

                    {/* 商品信息 */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                          <div className="mt-2 text-sm text-gray-500">
                            分类：{product.category} · 库存：{product.stock} 件
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</div>
                          {product.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</div>
                          )}
                        </div>
                      </div>

                      {/* 数量控制 */}
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-10 h-10 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition"
                          >
                            –
                          </button>
                          <div className="mx-4 text-xl font-bold text-gray-900">{qty} 件</div>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="ml-6 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition"
                          >
                            删除
                          </button>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(product.price * qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 优惠码 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">优惠码</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="输入优惠码"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-r-lg hover:opacity-90 transition">
                    应用
                  </button>
                </div>
              </div>
            </div>

            {/* 继续购物 */}
            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                ← 继续购物
              </Link>
            </div>
          </div>

          {/* 订单摘要 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">订单摘要</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">商品小计</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">运费</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? '免费' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">税费 (10%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>总计</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* 促销提示 */}
              {subtotal < 500 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <div className="text-amber-800 font-medium mb-1">🎉 还差 {formatCurrency(500 - subtotal)} 即可免运费！</div>
                  <p className="text-amber-700 text-sm">满 500 元免运费，快去凑单吧！</p>
                </div>
              )}

              {/* 结算按钮 */}
              <button
                onClick={() => alert('结算功能即将上线！')}
                className="w-full mt-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
              >
                去结算
              </button>

              {/* 支付方式 */}
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-3">支持支付方式</h4>
                <div className="flex space-x-3">
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* 保障声明 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <div className="mr-2">🔒</div>
                  <span>SSL 加密支付，保障资金安全</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="mr-2">↩️</div>
                  <span>7 天无忧退换，正品保证</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 返回主页 */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回主页
        </Link>
      </div>
    </div>
  );
}