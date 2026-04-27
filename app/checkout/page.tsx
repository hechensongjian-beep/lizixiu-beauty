'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, createOrder, createPaymentVerification, getPaymentSettings, getPromotions, applyDiscount } from '@/lib/api';

interface CartItem { productId: string; name: string; price: number; quantity: number; }
interface PaymentInfo { wechatQr: string; alipayQr: string; merchantName: string; }
interface Promotion {
  id: string;
  title: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applicable_to: string;
}

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
  const { toast } = useToast();
  const router = useRouter();
  const { role } = useAuth();
  const [products, setProducts] = useState<Record<string, any>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', shippingAddress: '' });
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'pickup' | 'delivery'>('express');
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60); // 30 minutes in seconds
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'wechat' | 'alipay'>('wechat');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);

  
    useEffect(() => { document.title = '订单结算 - 丽姿秀';
    Promise.all([getProducts(), getPaymentSettings(), getPromotions()]).then(([prodData, payData, promoData]) => {
      if (prodData?.products) {
        const m: Record<string, any> = {};
        prodData.products.forEach((p: any) => { m[p.id] = p; });
        setProducts(m);
      }
      if (payData) {
        const wq = payData.wechatQr || payData.wechat_qr_url || '';
        const aq = payData.alipayQr || payData.alipay_qr_url || '';
        setPaymentInfo({ wechatQr: wq, alipayQr: aq, merchantName: payData.merchantName || payData.merchant_name || '丽姿秀' });
        if (wq && !aq) setSelectedChannel('wechat');
        else if (aq && !wq) setSelectedChannel('alipay');
      }
      if (promoData?.promotions?.length > 0) {
        setPromotions(promoData.promotions);
        const productPromo = promoData.promotions.find((p: Promotion) => p.applicable_to === 'all' || p.applicable_to === 'products');
        if (productPromo) setAppliedPromotion(productPromo);
      }
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

    // Load delivery method from cart page
    const dm = localStorage.getItem('beauty-delivery-method');
    if (dm === 'express' || dm === 'pickup' || dm === 'delivery') setDeliveryMethod(dm);

    // Load saved addresses
    try {
      const addr = localStorage.getItem('beauty-saved-addresses');
      if (addr) setSavedAddresses(JSON.parse(addr));
    } catch {}

    // Load saved customer info for auto-fill
    try {
      const info = localStorage.getItem('beauty-customer-info');
      if (info) {
        const parsed = JSON.parse(info);
        setForm(f => ({
          customerName: f.customerName || parsed.name || '',
          customerPhone: f.customerPhone || parsed.phone || '',
          customerEmail: f.customerEmail || parsed.email || '',
          shippingAddress: f.shippingAddress || parsed.address || '',
        }));
      }
    } catch {}
  }, []);

  // 30-minute countdown timer
  useEffect(() => {
    if (orderCreated && !paymentSubmitted && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [orderCreated, paymentSubmitted, countdown]);

  const resolvedCart = cart.map(item => ({
    ...item,
    name: products[item.productId]?.name || item.name || '商品',
    price: products[item.productId]?.price || item.price || 0,
  }));

  const subtotal = resolvedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const freeDeliveryThreshold = 500;
  const shipping = deliveryMethod === 'pickup' || deliveryMethod === 'delivery' ? 0 : (subtotal >= freeDeliveryThreshold ? 0 : 15);
  const discountAmount = appliedPromotion ? subtotal - applyDiscount(subtotal, appliedPromotion) : 0;
  const total = subtotal - discountAmount + shipping;
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async () => {
    if (!form.customerName || !form.customerPhone) {
      setError('请填写姓名和手机号');
      return;
    }
    if (deliveryMethod !== 'pickup' && !form.shippingAddress) {
      setError('请填写收货地址（到店自取无需地址）');
      return;
    }
    setSubmitting(true);
    setError('');

    // Save customer info for auto-fill next time
    try {
      localStorage.setItem('beauty-customer-info', JSON.stringify({
        name: form.customerName, phone: form.customerPhone,
        email: form.customerEmail, address: form.shippingAddress,
      }));
      // Save address to address book
      if (form.shippingAddress) {
        const existing = JSON.parse(localStorage.getItem('beauty-saved-addresses') || '[]');
        if (!existing.includes(form.shippingAddress)) {
          existing.push(form.shippingAddress);
          localStorage.setItem('beauty-saved-addresses', JSON.stringify(existing));
        }
      }
    } catch {}

    try {
      const result = await createOrder({ ...form, items: resolvedCart, subtotal, shippingFee: shipping, tax: 0, total, deliveryMethod });
      if (result.success) {
        localStorage.removeItem('beauty-shop-cart');
        setCurrentOrder(result.order);
        setOrderCreated(true);
      } else {
        setError(result.error || '提交订单失败');
      }
    } catch { setError('网络连接失败，请稍后重试'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a87c]"></div>
    </div>
  );

  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="font-bold mb-4">购物车是空的</h1>
        <p className="var(--foreground-muted) mb-8">您还没有添加任何商品，无法结算。</p>
        <Link href="/products" className="inline-block px-5 py-2 font-medium rounded-md text-white transition hover:opacity-85" style={{background:'var(--primary)',boxShadow:'0 4px 15px rgba(201,168,124,0.35)'}}>
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <h1 className="font-bold mb-4">订单已创建</h1>
          <p className="var(--foreground-muted)">订单号：<span className="font-mono font-bold var(--foreground)">{currentOrder.id}</span></p>
          <p className="text-2xl font-bold mt-4" style={{color:'var(--primary)'}}>应付金额：{fmt(total)}</p>
        </div>

        <div className="bg-white border rgba(201,168,124,0.2) rounded-xl p-5 mb-8">
          <h2 className="font-bold mb-6 text-center">
            {hasQr ? '请使用以下方式扫码支付' : '请使用微信/支付宝转账至商家账户'}
          </h2>

          {hasQr ? (
            <div className="mb-8">
              <p className="text-center var(--foreground-muted) mb-4">请使用下方收款码扫码支付</p>
              {selectedChannel === 'wechat' && hasWechat && (
                <div className="text-center">
                  <img src={paymentInfo.wechatQr} alt="微信收款码" className="w-48 h-48 rounded-xl mx-auto mb-3 object-cover shadow-md border border-green-100" />
                  <div className="flex items-center justify-center gap-2 font-bold" style={{color:'#2d8a5e'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.87c-.135-.005-.27-.012-.406-.012zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>
                    微信支付
                  </div>
                </div>
              )}
              {selectedChannel === 'alipay' && hasAlipay && (
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
            <div className="text-center py-8 var(--background-card) rounded-xl mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'#faf8f5'}}>
                <IconClock className="var(--foreground-muted)" />
              </div>
              <p className="var(--foreground-muted)">商家暂未设置收款码</p>
              <p className="text-sm var(--foreground-muted) mt-2">请联系商家获取支付方式</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 var(--primary-dark) font-medium">
              <IconClock className="var(--primary-dark)" />
              订单将在 <strong>{Math.floor(countdown / 60)} 分{countdown % 60} 秒</strong> 后自动取消，请尽快完成支付
              {countdown === 0 && <span className="ml-2 var(--rose) font-bold">（已超时）</span>}
            </div>
          </div>
          <div className="mt-6 var(--background-card) rounded-xl p-4 text-sm var(--foreground) space-y-2">
            <p><strong>商家：</strong>{paymentInfo.merchantName}</p>
            <p><strong>收货人：</strong>{form.customerName}，{form.customerPhone}</p>
            {deliveryMethod !== 'pickup' && <p><strong>收货地址：</strong>{form.shippingAddress}</p>}
            <p><strong>配送方式：</strong>{deliveryMethod === 'express' ? '快递配送' : deliveryMethod === 'pickup' ? '到店自取' : '送货上门'}</p>
            <p><strong>支付金额：</strong><span className="font-bold" style={{color:'#a88a5c'}}>{fmt(total)}</span></p>
          </div>
        </div>

        {paymentSubmitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
              <IconCheck className="text-[#c9a87c]" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{color:'#2d4a3e'}}>支付已提交</h2>
            <p className="var(--foreground-muted) mb-4">商家将在 24 小时内核实到账信息并确认订单</p>
            <Link href="/orders" className="inline-block px-5 py-2 font-medium rounded-md text-white transition" style={{"background":'#2d4a3e'}}>
              查看我的订单
            </Link>
          </div>
        ) : (
            <div className="text-center">
              {hasWechat && hasAlipay && (
                <div className="mb-6 p-4 var(--background-card) rounded-xl">
                  <p className="text-sm var(--foreground-muted) mb-3">请选择支付方式：</p>
                  <div className="flex justify-center gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-xl border-2 transition ${selectedChannel === 'wechat' ? 'var(--sage) bg-green-50' : 'rgba(201,168,124,0.2) hover:border-green-300'}`}>
                      <input type="radio" name="pchannel" value="wechat" checked={selectedChannel === 'wechat'} onChange={() => setSelectedChannel('wechat')} className="hidden" />
                      <span className="font-bold var(--sage)">微信支付</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-xl border-2 transition ${selectedChannel === 'alipay' ? 'var(--primary) bg-blue-50' : 'rgba(201,168,124,0.2) hover:border-blue-300'}`}>
                      <input type="radio" name="pchannel" value="alipay" checked={selectedChannel === 'alipay'} onChange={() => setSelectedChannel('alipay')} className="hidden" />
                      <span className="font-bold var(--primary)">支付宝</span>
                    </label>
                  </div>
                </div>
              )}
              <p className="var(--foreground-muted) mb-4 text-base">扫码支付完成后，点击下方按钮提交凭证</p>
            <button
              onClick={async () => {
                if (!currentOrder) return;
                setSubmittingPayment(true);
                try {
                  const channel = selectedChannel;
                  const res = await createPaymentVerification({
                    order_id: currentOrder.id,
                    customer_name: form.customerName,
                    customer_phone: form.customerPhone,
                    amount: total,
                    payment_channel: channel,
                  });
                  if (res.success) { setPaymentSubmitted(true); }
                  else { toast.error(res.error || '提交失败，请重试'); }
                } catch { toast.error('网络错误，请重试'); }
                finally { setSubmittingPayment(false); }
              }}
              disabled={submittingPayment || !hasQr}
              className="px-10 py-2.5 font-medium rounded-lg text-white transition disabled:opacity-50"
              style={{background:'var(--accent)'}}
            >
              {submittingPayment ? '提交中...' : '我已扫码支付，提交凭证'}
            </button>
            {!hasQr && <p className="text-sm var(--foreground-muted) mt-2">商家暂未配置收款码，请联系商家获取支付方式</p>}
            <div className="mt-4"><Link href="/orders" className="var(--foreground-muted) hover:var(--foreground) text-sm">查看我的订单</Link></div>
          </div>
        )}
      </div>
    );
  }

  // 结算表单
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {role === 'guest' && (
        <div className="mb-8 rounded-2xl p-6 text-center" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)',"border":'1px solid rgba(201,168,124,0.3)'}}>
          <p className="var(--foreground) font-medium mb-3">您当前以访客身份操作，填写下方信息可直接下单</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/login" className="px-4 py-1.5 text-white font-medium rounded-md transition hover:opacity-85" style={{background:'var(--primary)'}}>登录/注册</Link>
            <span className="var(--foreground-muted) text-base">登录后可保存订单记录、享受更多服务</span>
          </div>
        </div>
      )}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h1 className="font-bold mb-4">结算</h1>
        <p className="var(--foreground-muted)">请填写收货信息，确认订单无误后提交。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white border rgba(201,168,124,0.2) rounded-xl p-5 mb-8">
            <h2 className="font-bold mb-6">配送与收货</h2>

            {/* 配送方式 */}
            <div className="mb-8">
              <label className="block var(--foreground) font-medium mb-3">配送方式</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'express' as const, label: '快递配送', desc: subtotal >= freeDeliveryThreshold ? '满500免运费' : '运费15元' },
                  { key: 'pickup' as const, label: '到店自取', desc: '免费' },
                  { key: 'delivery' as const, label: '送货上门', desc: '镇内免费' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setDeliveryMethod(opt.key)}
                    className={`p-4 rounded-xl text-center transition border-2 ${deliveryMethod === opt.key ? 'border-[#c9a87c] bg-[#faf8f5]' : 'rgba(201,168,124,0.2) hover:border-[#c9a87c44]'}`}>
                    <div className="font-bold var(--foreground)">{opt.label}</div>
                    <div className="text-sm var(--foreground-muted) mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 收货信息 */}
            <h3 className="font-bold var(--foreground) mb-4">收货信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block var(--foreground) font-medium mb-2">姓名 *</label>
                <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required placeholder="收货人姓名"
                  className="w-full px-3 py-2.5 border rgba(201,168,124,0.3) rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div>
                <label className="block var(--foreground) font-medium mb-2">手机号 *</label>
                <input type="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange} required placeholder="手机号码"
                  className="w-full px-3 py-2.5 border rgba(201,168,124,0.3) rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div className="md:col-span-2">
                <label className="block var(--foreground) font-medium mb-2">电子邮箱</label>
                <input type="email" name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="选填"
                  className="w-full px-3 py-2.5 border rgba(201,168,124,0.3) rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              {deliveryMethod !== 'pickup' && (
                <div className="md:col-span-2 relative">
                  <label className="block var(--foreground) font-medium mb-2">收货地址 *</label>
                  <input type="text" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required
                    placeholder="详细收货地址" onFocus={() => savedAddresses.length > 0 && setShowSavedAddresses(true)}
                    onBlur={() => setTimeout(() => setShowSavedAddresses(false), 200)}
                    className="w-full px-3 py-2.5 border rgba(201,168,124,0.3) rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]" />
                  {showSavedAddresses && savedAddresses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rgba(201,168,124,0.2) rounded-lg shadow-lg max-h-40 overflow-auto">
                      {savedAddresses.map((addr, i) => (
                        <button key={i} type="button" onMouseDown={() => { setForm(f => ({ ...f, shippingAddress: addr })); setShowSavedAddresses(false); }}
                          className="w-full text-left px-4 py-2 hover:var(--background-card) text-sm var(--foreground) border-b border-[var(--background-secondary)] last:border-0">
                          {addr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {deliveryMethod === 'pickup' && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.2)'}}>
                <span className="var(--foreground)">到店自取：请到门店出示订单号取货，门店地址由商家确认后通知。</span>
              </div>
            )}
            {deliveryMethod === 'delivery' && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.2)'}}>
                <span className="var(--foreground)">送货上门：三乡镇范围内免费配送，超出范围请联系商家确认运费。</span>
              </div>
            )}
            {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 var(--rose) rounded-lg">{error}</div>}
            <div className="mt-8 flex justify-between items-center">
              <Link href="/cart" className="flex items-center px-6 py-3 border-2 rgba(201,168,124,0.3) var(--foreground) font-medium rounded-md hover:var(--background-card) transition">
                <IconArrowLeft className="mr-1" /> 返回购物车
              </Link>
              <button onClick={handleSubmitOrder} disabled={submitting}
                className="px-10 py-2.5 font-medium rounded-lg text-white transition disabled:opacity-50"
                style={{background:'var(--accent)',boxShadow:'0 4px 15px rgba(45,74,62,0.2)'}}>
                {submitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border rgba(201,168,124,0.2) rounded-xl p-5 shadow-lg">
            <h2 className="font-bold mb-6">订单摘要</h2>
            <div className="space-y-4 mb-8">
              {resolvedCart.map(item => (
                <div key={item.productId} className="flex justify-between items-center border-b border-[var(--background-secondary)] pb-4">
                  <div>
                    <div className="font-medium var(--foreground)">{item.name}</div>
                    <div className="text-sm var(--foreground-muted)">{item.quantity} x {fmt(item.price)}</div>
                  </div>
                  <div className="font-bold" style={{color:'var(--foreground)'}}>{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
                <div className="flex justify-between"><span className="var(--foreground)">商品小计</span><span className="font-medium" style={{color:'var(--foreground)'}}>{fmt(subtotal)}</span></div>
              {appliedPromotion && discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="var(--rose)">活动优惠 ({appliedPromotion.title})</span>
                  <span className="font-medium var(--rose)">-{fmt(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="var(--foreground)">运费</span><span className={`font-medium ${shipping === 0 ? 'var(--sage)' : ''}`} style={{color: shipping === 0 ? undefined : 'var(--foreground)'}}>{shipping === 0 ? '免费' : fmt(shipping)}</span></div>
              <div className="flex justify-between"><span className="var(--foreground)">配送方式</span><span className="font-medium">{deliveryMethod === 'express' ? '快递' : deliveryMethod === 'pickup' ? '到店自取' : '送货上门'}</span></div>
              <div className="border-t rgba(201,168,124,0.2) pt-4">
                <div className="flex justify-between font-bold"><span>总计</span><span style={{color:'var(--primary)'}}>{fmt(total)}</span></div>
              </div>
            </div>
            <div className="border-t rgba(201,168,124,0.2) pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm var(--foreground-muted)"><IconShield className="var(--foreground-muted)" /><span>SSL 加密支付</span></div>
              <div className="flex items-center gap-2 text-sm var(--foreground-muted)"><IconReturn className="var(--foreground-muted)" /><span>7 天无忧退换</span></div>
              {(paymentInfo.wechatQr || paymentInfo.alipayQr) && (
                <div className="flex items-center gap-2 text-base mt-2" style={{color:'#2d8a5e'}}>
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
