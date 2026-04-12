'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, createOrder, createPaymentVerification } from '@/lib/api';

interface CartItem { productId: string; name: string; price: number; quantity: number; }
interface PaymentInfo { wechatQr: string; alipayQr: string; merchantName: string; }

export default function CheckoutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, any>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', shippingAddress: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    Promise.all([
      getProducts(),
      Promise.resolve({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' }),
    ]).then(([prodData, payData]) => {
      if (prodData?.products) {
        const m: Record<string, any> = {};
        prodData.products.forEach((p: any) => { m[p.id] = p; });
        setProducts(m);
      }
      if (payData) setPaymentInfo(payData);
      setLoading(false);
    }).catch(() => setLoading(false));

    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        const items: CartItem[] = [];
        Object.entries(obj).forEach(([id, qty]) => { items.push({ productId: id, name: '', price: 0, quantity: qty as number }); });
        setCart(items);
      } catch {}
    }
  }, []);

  const resolvedCart = cart.map(item => ({
    ...item,
    name: products[item.productId]?.name || item.name || '商品',
    price: products[item.productId]?.price || item.price || 0,
  }));

  const subtotal = resolvedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = Math.round(subtotal * 0.06 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async () => {
    if (!form.customerName || !form.customerPhone || !form.shippingAddress) {
      setError('请填写完整的收货信息（姓名、手机号、收货地址）');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await createOrder({ ...form, items: resolvedCart, subtotal, shippingFee: shipping, tax, total });
      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem('beauty-shop-cart');
        setCurrentOrder(result.order);
        setOrderCreated(true);
      } else {
        setError(result.error || '提交订单失败');
      }
    } catch { setError('网络错误，请检查网络连接'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>;

  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">购物车是空的</h1>
        <p className="text-gray-600 mb-8">您还没有添加任何商品，无法结算。</p>
        <Link href="/products" className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition">返回产品商店</Link>
      </div>
    );
  }

  // 收款码页面
  if (orderCreated && currentOrder) {
    const hasWechat = !!paymentInfo.wechatQr;
    const hasAlipay = !!paymentInfo.alipayQr;
    const hasQr = hasWechat || hasAlipay;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl mb-6">
            <div className="text-3xl">💳</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">订单已创建</h1>
          <p className="text-gray-600">订单号：<span className="font-mono font-bold text-gray-900">{currentOrder.id}</span></p>
          <p className="text-2xl font-bold text-pink-600 mt-4">应付金额：¥{total.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {hasQr ? `请使用以下方式扫码支付` : `请使用微信/支付宝转账至商家账户`}
          </h2>

          {hasQr ? (
            <div className="grid grid-cols-2 gap-8 mb-8">
              {hasWechat && (
                <div className="text-center">
                  <img src={paymentInfo.wechatQr} alt="微信收款码" className="w-48 h-48 rounded-xl mx-auto mb-3 object-cover shadow-md border border-green-100" />
                  <p className="font-bold text-green-600">💚 微信支付</p>
                </div>
              )}
              {hasAlipay && (
                <div className="text-center">
                  <img src={paymentInfo.alipayQr} alt="支付宝收款码" className="w-48 h-48 rounded-xl mx-auto mb-3 object-cover shadow-md border border-blue-100" />
                  <p className="font-bold text-blue-600">💙 支付宝</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-6">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-600">商家暂未设置收款码</p>
              <p className="text-sm text-gray-500 mt-2">请联系商家获取支付方式</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-medium">⏰ 订单将在 <strong>30 分钟</strong> 后自动取消，请尽快完成支付</p>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
            <p><strong>商家：</strong>{paymentInfo.merchantName}</p>
            <p><strong>收货人：</strong>{form.customerName}，{form.customerPhone}</p>
            <p><strong>收货地址：</strong>{form.shippingAddress}</p>
            <p><strong>支付金额：</strong><span className="text-pink-600 font-bold">¥{total.toFixed(2)}</span></p>
          </div>
        </div>

        {paymentSubmitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">支付已提交</h2>
            <p className="text-gray-600 mb-4">商家将在 24 小时内核实到账信息并确认订单</p>
            <Link href="/orders" className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">
              查看我的订单
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4 text-sm">* 扫码支付完成后，点击下方按钮提交凭证</p>
            <button
              onClick={async () => {
                if (!currentOrder) return;
                setSubmittingPayment(true);
                try {
                  const channel = hasWechat ? 'wechat' : 'alipay';
                  const res = await createPaymentVerification({
                      order_id: currentOrder.id,
                      customer_name: form.customerName,
                      customer_phone: form.customerPhone,
                      amount: total,
                      payment_channel: channel,
                    });
                  if (res.ok) {
                    setPaymentSubmitted(true);
                  } else {
                    const err = await res.json();
                    alert(err.error || '提交失败，请重试');
                  }
                } catch { alert('网络错误，请重试'); }
                finally { setSubmittingPayment(false); }
              }}
              disabled={submittingPayment || !hasQr}
              className="px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingPayment ? '提交中...' : '✅ 我已扫码支付，提交凭证'}
            </button>
            {!hasQr && <p className="text-sm text-gray-500 mt-2">商家暂未配置收款码，请联系商家获取支付方式</p>}
            <div className="mt-4"><Link href="/orders" className="text-gray-500 hover:text-gray-700 text-sm">查看我的订单 →</Link></div>
          </div>
        )}
      </div>
    );
  }

  // 结算表单
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl mb-6"><div className="text-3xl">💰</div></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">结算</h1>
        <p className="text-gray-600">请填写收货信息，确认订单无误后提交。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">收货信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-medium mb-2">姓名 *</label>
                <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required placeholder="收货人姓名" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">手机号 *</label>
                <input type="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange} required placeholder="手机号码" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-800 font-medium mb-2">电子邮箱</label>
                <input type="email" name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="选填" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-800 font-medium mb-2">收货地址 *</label>
                <textarea name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required rows={3} placeholder="详细收货地址" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
            <div className="mt-8 flex justify-between items-center">
              <Link href="/cart" className="px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition">← 返回购物车</Link>
              <button onClick={handleSubmitOrder} disabled={submitting} className="px-10 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition disabled:opacity-50">
                {submitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">订单摘要</h2>
            <div className="space-y-4 mb-8">
              {resolvedCart.map(item => (
                <div key={item.productId} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div><div className="font-medium text-gray-900">{item.name}</div><div className="text-sm text-gray-600">{item.quantity} × ¥{item.price.toFixed(2)}</div></div>
                  <div className="font-bold">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="flex justify-between pt-4"><span className="text-gray-700">商品小计</span><span className="font-medium">¥{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-700">运费</span><span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-700">增值税 (6%)</span><span className="font-medium">¥{tax.toFixed(2)}</span></div>
              <div className="border-t border-gray-200 pt-4"><div className="flex justify-between text-xl font-bold text-gray-900"><span>总计</span><span>¥{total.toFixed(2)}</span></div></div>
            </div>
            <div className="border-t border-gray-200 pt-6 space-y-2">
              <div className="flex items-center text-sm text-gray-600"><span className="mr-2">🔒</span><span>SSL 加密支付</span></div>
              <div className="flex items-center text-sm text-gray-600"><span className="mr-2">↩️</span><span>7 天无忧退换</span></div>
              {(paymentInfo.wechatQr || paymentInfo.alipayQr) && (
                <div className="flex items-center text-sm text-green-600 mt-2"><span className="mr-2">✅</span><span>商家收款码已配置</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
