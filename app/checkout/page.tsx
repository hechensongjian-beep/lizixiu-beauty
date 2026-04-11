'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 从 localStorage 加载购物车并转换为订单项
  useEffect(() => {
    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) {
      try {
        const cartObj = JSON.parse(saved);
        // 这里需要产品数据来获取名称和价格，为了简化，我们使用 mock 数据映射
        const mockProducts = [
          { id: '1', name: '玫瑰精油焕肤套装', price: 298 },
          { id: '2', name: '玻尿酸补水面膜（10片装）', price: 128 },
          { id: '3', name: '茶树祛痘洁面乳', price: 88 },
          { id: '4', name: '维生素C精华液', price: 256 },
          { id: '5', name: '防晒隔离霜 SPF50+', price: 158 },
          { id: '6', name: '颈纹修护霜', price: 328 },
          { id: '7', name: '身体磨砂膏（玫瑰香）', price: 98 },
          { id: '8', name: '护手霜礼盒（3支装）', price: 168 },
        ];
        const items: CartItem[] = [];
        Object.entries(cartObj).forEach(([productId, qty]) => {
          const product = mockProducts.find(p => p.id === productId);
          if (product) {
            items.push({
              productId,
              name: product.name,
              price: product.price,
              quantity: qty as number,
            });
          }
        });
        setCart(items);
      } catch (e) {
        console.error('解析购物车失败', e);
      }
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 构造订单数据
    const orderData = {
      ...form,
      items: cart,
      subtotal,
      shippingFee: shipping,
      tax,
      total,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (response.ok) {
        // 清空购物车
        localStorage.removeItem('beauty-shop-cart');
        // 跳转到订单确认页（暂时用订单列表页代替）
        router.push('/orders');
      } else {
        setError(result.error || '提交订单失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">购物车是空的</h1>
        <p className="text-gray-600 mb-8">您还没有添加任何商品，无法结算。</p>
        <Link
          href="/products"
          className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition"
        >
          返回产品商店
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl mb-6">
          <div className="text-3xl">💰</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">结算</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          请填写收货信息，确认订单无误后提交。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 左侧：表单 */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">收货信息</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">姓名 *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="请输入收货人姓名"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">手机号 *</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="请输入手机号"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-800 font-medium mb-2">电子邮箱</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="请输入电子邮箱（选填）"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-800 font-medium mb-2">收货地址 *</label>
                  <textarea
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="请输入详细的收货地址"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-8 flex justify-between items-center">
                <Link
                  href="/cart"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  ← 返回购物车
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? '提交中...' : '提交订单'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 右侧：订单摘要 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">订单摘要</h2>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × ¥{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-bold">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <span className="text-gray-700">商品小计</span>
                <span className="font-medium">¥{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">运费</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">税费 (10%)</span>
                <span className="font-medium">¥{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>总计</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 保障声明 */}
            <div className="border-t border-gray-200 pt-6">
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
    </div>
  );
}