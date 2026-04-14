'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, createOrder, createPaymentVerification, getPaymentSettings } from '@/lib/api';

interface CartItem { productId: string; name: string; price: number; quantity: number; }
interface PaymentInfo { wechatQr: string; alipayQr: string; merchantName: string; }

function IconShield({ className }: { className?: string }) {
  return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function IconReturn({ className }: { className?: string }) {
  return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.36"/></svg>;
}
function IconCheck({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconClock({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconArrowLeft({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}

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
    Promise.all([getProducts(), getPaymentSettings()]).then(([prodData, payData]) => {
      if (prodData?.products) {
        const m: Record<string, any> = {};
        prodData.products.forEach((p: any) => { m[p.id] = p; });
        setProducts(m);
      }
      if (payData) setPaymentInfo({
        wechatQr: payData.wechatQr || payData.wechat_qr_url || '',
        alipayQr: payData.alipayQr || payData.alipay_qr_url || '',
        merchantName: payData.merchantName || payData.merchant_name || '丽姿秀',
      });
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
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

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
      const result = await createOrder({ ...form, items: resolvedCart, subtotal, shippingFee: shipping, tax, total });
      if (result.success) {
        localStorage.removeItem('beauty-shop-cart');
        setCurrentOrder(result.order);
        setOrderCreated(true);
      } else {
        setError(result.error || '提交订单失败');
      }
    } catch { setError('网络错误，请检查网络连接'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a87c]"></div>
    </div>
  );

  // 空购物车
  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">购物车是空的</h1>
        <p className="text-gray-600 mb-8">您还没有添加任何商品，无法结算。</p>
        <Link href="/products" className="inline-block px-8 py-3 font-bold rounded-lg text-white transition" style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}>
          返回产品商店
        </Link>
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">订单已创建</h1>
          <p className="text-gray-600">订单号：<span className="font-mono font-bold text-gray-900">{currentOrder.id}</span></p>
          <p className="text-2xl font-bold mt-4" style={{color:'#a88a5c'}}>应付金额：{fmt(total)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {hasQr ? '请使用以下方式扫码支付' : '请使用微信/支付宝转账至商家账户'}
          </h2>

          {hasQr ? (
            <div className="grid grid-cols-2 gap-8 mb-8">
              {hasWechat && (
                <div className="text-center">
                  <img src={paymentInfo.wechatQr} alt="微信收款码" className="w-48 h-48 rounded-xl mx-auto mb-3 object-cover shadow-md border border-green-100" />
                  <div className="flex items-center justify-center gap-2 font-bold" style={{color:'#2d8a5e'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.87c-.135-.005-.27-.012-.406-.012zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>
                    微信支付
                  </div>
                </div>
              )}
              {hasAlipay && (
                <div className="text-center">
                  <img src={paymentInfo.alipayQr} alt="支付宝收款码" className="w-48 h-48 rounded-xl mx-auto mb-3 object-cover shadow-md border border-blue-100" />
                  <div className="flex items-center justify-center gap-2 font-bold" style={{color:'#1677ff'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.594 9.478c-.042-2.224-2.396-3.47-4.51-3.47-1.148 0-2.275.417-3.135 1.138L12 10.23l-2.006-3.084C9.275 6.425 8.148 6 6.992 6 4.878 6 2.5 7.254 2.5 9.478c0 .217.028.434.076.643C1.643 11.267 0 13.003 0 15.1c0 3.336 4.082 5.706 8.644 5.706 1.176 0 2.305-.17 3.356-.47v-2.074c-.91.318-1.876.484-2.85.476-2.76 0-4.89-1.484-4.89-3.946h8.72c.036-.21.056-.426.056-.646 0-2.32-2.083-4.068-4.44-4.068z"/></svg>
                    支付宝
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'#faf8f5'}}>
                <IconClock className="text-gray-400" />
              </div>
              <p className="text-gray-600">商家暂未设置收款码</p>
              <p className="text-sm text-gray-500 mt-2">请联系商家获取支付方式</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-800 font-medium">
              <IconClock className="text-amber-800" />
              订单将在 <strong>30 分钟</strong> 后自动取消，请尽快完成支付
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
            <p><strong>商家：</strong>{paymentInfo.merchantName}</p>
            <p><strong>收货人：</strong>{form.customerName}，{form.customerPhone}</p>
            <p><strong>收货地址：</strong>{form.shippingAddress}</p>
            <p><strong>支付金额：</strong><span className="font-bold" style={{color:'#a88a5c'}}>{fmt(total)}</span></p>
          </div>
        </div>

        {paymentSubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
              <IconCheck className="text-[#c9a87c]" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{color:'#2d4a3e'}}>支付已提交</h2>
            <p className="text-gray-600 mb-4">商家将在 24 小时内核实到账信息并确认订单</p>
            <Link href="/orders" className="inline-block px-8 py-3 font-bold rounded-lg text-white transition" style={{"background":'#2d4a3e'}}>
              查看我的订单
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4 text-sm">扫码支付完成后，点击下方按钮提交凭证</p>
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
                  if (res.success) { setPaymentSubmitted(true); }
                  else { alert(res.error || '提交失败，请重试'); }
                } catch { alert('网络错误，请重试'); }
                finally { setSubmittingPayment(false); }
              }}
              disabled={submittingPayment || !hasQr}
              className="px-10 py-3 font-bold text-lg rounded-lg text-white transition disabled:opacity-50"
              style={{"background":'linear-gradient(135deg,#2d4a3e 0%,#3d6252 100%)'}}
            >
              {submittingPayment ? '提交中...' : '我已扫码支付，提交凭证'}
            </button>
            {!hasQr && <p className="text-sm text-gray-500 mt-2">商家暂未配置收款码，请联系商家获取支付方式</p>}
            <div className="mt-4"><Link href="/orders" className="text-gray-500 hover:text-gray-700 text-sm">查看我的订单</Link></div>
          </div>
        )}
      </div>
    );
  }

  // 结算表单
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
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
                <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required placeholder="收货人姓名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">手机号 *</label>
                <input type="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange} required placeholder="手机号码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-800 font-medium mb-2">电子邮箱</label>
                <input type="email" name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="选填"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-800 font-medium mb-2">收货地址 *</label>
                <textarea name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required rows={3} placeholder="详细收货地址"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
            </div>
            {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
            <div className="mt-8 flex justify-between items-center">
              <Link href="/cart" className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition">
                <IconArrowLeft className="mr-1" /> 返回购物车
              </Link>
              <button onClick={handleSubmitOrder} disabled={submitting}
                className="px-10 py-3 font-bold text-lg rounded-lg text-white transition disabled:opacity-50"
                style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}>
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
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.quantity} x {fmt(item.price)}</div>
                  </div>
                  <div className="font-bold">{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
              <div className="flex justify-between pt-4"><span className="text-gray-700">商品小计</span><span className="font-medium">{fmt(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-700">运费</span><span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? '免费' : fmt(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-700">增值税 (6%)</span><span className="font-medium">{fmt(tax)}</span></div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900"><span>总计</span><span>{fmt(total)}</span></div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600"><IconShield className="text-gray-500" /><span>SSL 加密支付</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><IconReturn className="text-gray-500" /><span>7 天无忧退换</span></div>
              {(paymentInfo.wechatQr || paymentInfo.alipayQr) && (
                <div className="flex items-center gap-2 text-sm mt-2" style={{color:'#2d8a5e'}}>
                  <IconCheck className="text-[#2d8a5e]" />
                  <span>商家收款码已配置</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
