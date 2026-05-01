'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  
    useEffect(() => { document.title = '我的订单 - 丽姿秀';
    getOrders()
      .then(data => {
        setOrders(data?.orders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取订单失败', err);
        setLoading(false);
      });
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'rgba(168,138,92,0.15) var(--foreground)';
      case 'paid': return 'rgba(201,168,124,0.2) text-[var(--foreground)]';
      case 'shipped': return 'bg-[var(--primary)] text-white';
      case 'delivered': return 'rgba(156,175,136,0.15) var(--sage)';
      case 'cancelled': return 'rgba(220,38,38,0.08) var(--rose)';
      default: return 'var(--background-secondary) var(--foreground)';
    }
  };

const translateStatus = async (status: string) => {
    const map: Record<string, string> = {
      pending: '待付款',
      paid: '已付款',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    };
    return map[status] || status;
  };


  const cancelOrder = async (orderId: string) => {
    if (!await toast.confirm('确定要取消这个订单吗？')) return;
    try {
      const result = await updateOrderStatus(orderId, 'cancelled');
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      } else {
        toast.error(result.error || '取消失败，请重试');
      }
    } catch {
      toast.error('网络错误，请重试');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary-light)]/10 rounded-2xl mb-6">
          <div className="text-xl"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
        </div>
        <h1 className="text-xl font-medium text-[var(--foreground)] mb-4">我的订单</h1>
        <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
          查看您的所有订单记录与状态。
        </p>
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-10 w-48 rounded-lg animate-pulse text-[var(--background-secondary)] mb-8"></div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 text-[var(--background-secondary)] rounded w-32"></div>
                  <div className="h-4 text-[var(--background-secondary)] rounded w-24"></div>
                </div>
                <div className="h-6 w-20 text-[var(--background-secondary)] rounded-full"></div>
              </div>
              <div className="h-4 text-[var(--background-secondary)] rounded w-full mb-2"></div>
              <div className="h-4 text-[var(--background-secondary)] rounded w-48"></div>
            </div>
            <div className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 text-[var(--background-secondary)] rounded w-32"></div>
                  <div className="h-4 text-[var(--background-secondary)] rounded w-24"></div>
                </div>
                <div className="h-6 w-20 text-[var(--background-secondary)] rounded-full"></div>
              </div>
              <div className="h-4 text-[var(--background-secondary)] rounded w-full mb-2"></div>
              <div className="h-4 text-[var(--background-secondary)] rounded w-48"></div>
            </div>
          </div>
        </div>
      ) : orders.length === 0 && role === 'guest' ? (
        <div className="bg-[var(--background)] border rgba(201,168,124,0.2) rounded-2xl p-16 text-center">
          <div className="mb-6 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <h3 className="text-xl font-bold mb-4" style={{color:'var(--foreground)'}}>查看我的订单</h3>
          <p className="text-[var(--foreground-muted)] max-w-md mx-auto mb-8">
            登录后即可查看您的所有订单记录
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/login" className="px-8 py-3 rounded-full text-white font-bold text-sm" style={{background:'var(--accent)',boxShadow:'0 4px 16px rgba(45,74,62,0.35)'}}>
              登录 / 注册
            </Link>
            <Link href="/products" className="px-8 py-3 rounded-full font-bold text-sm" style={{border:'1px solid rgba(201,168,124,0.5)',color:'var(--accent)'}}>
              先去逛逛
            </Link>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[var(--background)] border rgba(201,168,124,0.2) rounded-2xl p-16 text-center">
          <div className="mb-6 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <h3 className="text-xl font-medium text-[var(--foreground)] mb-4">暂无订单</h3>
          <p className="text-[var(--foreground-muted)] max-w-md mx-auto mb-8">
            您还没有创建任何订单。快去产品商店逛逛吧！
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-[var(--accent)] text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
          >
             去产品商店
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border rgba(201,168,124,0.2) rounded-2xl p-8 hover:shadow-lg transition"
            >
              {/* 订单头部 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b rgba(201,168,124,0.2)">
                <div>
                  <h3 className="text-xl font-medium text-[var(--foreground)]">订单 #{order.id.substring(0, 12)}</h3>
                  <p className="text-base text-[var(--foreground-muted)] mt-2">创建于 {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`} style={{fontSize:'1rem'}}>
                    {translateStatus(order.status)}
                  </span>
                  <div className="text-xl font-medium text-[var(--foreground)]">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              </div>

              {/* 客户信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-bold text-[var(--foreground)] mb-3">客户信息</h4>
                  <p className="text-base text-[var(--foreground)]">{order.customerName}</p>
                  <p className="text-base text-[var(--foreground)]">{order.customerPhone}</p>
                  {order.customerEmail && (
                    <p className="text-base text-[var(--foreground)]">{order.customerEmail}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--foreground)] mb-3">收货地址</h4>
                  <p className="text-base text-[var(--foreground)] whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              </div>

              {/* 商品列表 */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-4">商品清单</h4>
                <div className="border rgba(201,168,124,0.2) rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="text-[var(--background-card)]">
                      <tr>
                        <th className="py-3 px-4 text-left font-bold text-[var(--foreground)]" style={{fontSize:'1rem'}}>商品</th>
                        <th className="py-3 px-4 text-left font-bold text-[var(--foreground)]" style={{fontSize:'1rem'}}>单价</th>
                        <th className="py-3 px-4 text-left font-bold text-[var(--foreground)]" style={{fontSize:'1rem'}}>数量</th>
                        <th className="py-3 px-4 text-left font-bold text-[var(--foreground)]" style={{fontSize:'1rem'}}>小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-t rgba(201,168,124,0.2)">
                          <td className="py-4 px-4 font-medium text-[var(--foreground)]" style={{fontSize:'1rem'}}>{item.name}</td>
                          <td className="py-4 px-4" style={{fontSize:'1rem'}}>{formatCurrency(item.price)}</td>
                          <td className="py-4 px-4" style={{fontSize:'1rem'}}>{item.quantity}</td>
                          <td className="py-4 px-4 font-bold" style={{fontSize:'1rem'}}>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 订单摘要 */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground)]">商品小计</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground)]">运费</span>
                      <span className="font-medium">
                        {order.shippingFee === 0 ? '免费' : formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground)]">税费</span>
                      <span className="font-medium">{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="border-t rgba(201,168,124,0.2) pt-3">
                      <div className="flex justify-between text-xl font-bold text-[var(--foreground)]">
                        <span>总计</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-4 mt-8 pt-8 border-t rgba(201,168,124,0.2)">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { window.location.href = '/checkout'; }}
                      className="px-6 py-3 text-white font-bold rounded-lg hover:opacity-90 transition" style={{ background: 'var(--accent)' }}
                    >
                      立即支付
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-6 py-3 font-bold rounded-lg transition" style={{background:'rgba(239,68,68,0.1)',color:'var(--rose)'}}
                    >
                      取消订单
                    </button>
                  </>
                )}
                <button
                  onClick={() => { toast.info('订单详情：' + order.id.substring(0, 12)); }}
                  className="px-6 py-3 border-2 rgba(201,168,124,0.3) text-[var(--foreground)] font-bold rounded-lg hover:bg-[var(--background-card)] transition"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 返回链接 */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回主页
        </Link>
      </div>
    </div>
  );
}