'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getOrders, updateOrderStatus } from '@/lib/api';

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

// 确认弹窗组件
function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  confirmStyle,
  onConfirm, 
  onCancel 
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmStyle: 'primary' | 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const buttonStyles = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="text-base mb-6" style={{ color: 'var(--foreground-muted)' }}>{message}</p>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="btn btn-outline">{cancelText}</button>
          <button onClick={onConfirm} className={buttonStyles[confirmStyle]}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // 弹窗状态
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    orderId: string;
    action: 'confirm_payment' | 'complete' | 'cancel';
    title: string;
    message: string;
  } | null>(null);

  // 超时订单警告
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutOrders, setTimeoutOrders] = useState<Order[]>([]);

  // 权限检查
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // 检查超过1天未处理的订单
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const timeout = orders.filter(o => 
      o.status === 'pending' && new Date(o.createdAt) < oneDayAgo
    );
    setTimeoutOrders(timeout);
    if (timeout.length > 0) {
      setShowTimeoutWarning(true);
    }
  }, [orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data?.orders || []);
    } catch (error) {
      console.error('获取订单失败', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matches =
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term));
      if (!matches) return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const data = await updateOrderStatus(orderId, newStatus);
      if (data.success) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        );
        setDialog(null);
      } else {
        alert(`更新失败: ${data.error}`);
      }
    } catch (error) {
      console.error('更新订单状态失败', error);
      alert('网络错误，请重试');
    } finally {
      setUpdating(null);
    }
  };

  const openDialog = (orderId: string, action: 'confirm_payment' | 'complete' | 'cancel') => {
    const dialogs = {
      confirm_payment: {
        title: '确认收款',
        message: '确定已收到客户付款？此操作将订单状态更新为"已付款"。',
      },
      complete: {
        title: '完成订单',
        message: '确定该订单已完成配送？此操作将订单状态更新为"已送达"。',
      },
      cancel: {
        title: '取消订单',
        message: '确定要取消该订单？此操作不可撤销。',
      },
    };
    setDialog({ isOpen: true, orderId, action, ...dialogs[action] });
  };

  const handleConfirm = () => {
    if (!dialog) return;
    const statusMap = {
      confirm_payment: 'paid',
      complete: 'delivered',
      cancel: 'cancelled',
    };
    handleUpdateStatus(dialog.orderId, statusMap[dialog.action]);
  };

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
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: '待付款',
      paid: '已付款',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    };
    return map[status] || status;
  };

  const statusOptions = [
    { value: 'pending', label: '待付款' },
    { value: 'paid', label: '已付款' },
    { value: 'shipped', label: '已发货' },
    { value: 'delivered', label: '已送达' },
    { value: 'cancelled', label: '已取消' },
  ];

  // 统计数据
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
          订单管理
        </h1>
        <p className="text-base" style={{ color: 'var(--foreground-muted)' }}>
          管理所有客户订单，处理付款与发货
        </p>
      </div>

      {/* 超时警告 */}
      {showTimeoutWarning && timeoutOrders.length > 0 && (
        <div className="mb-6 p-5 rounded-xl border-2 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 text-lg mb-1">
                有 {timeoutOrders.length} 个订单超过24小时未处理
              </h3>
              <p className="text-amber-700 text-sm mb-3">
                以下订单已超过24小时未确认付款，请尽快处理：
              </p>
              <div className="space-y-2">
                {timeoutOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <span className="font-medium">#{o.id.substring(0, 8)}</span>
                      <span className="text-gray-500 ml-2">{o.customerName}</span>
                      <span className="text-gray-500 ml-2">{formatCurrency(o.total)}</span>
                    </div>
                    <button
                      onClick={() => openDialog(o.id, 'confirm_payment')}
                      className="btn-sm btn-primary"
                    >
                      立即处理
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowTimeoutWarning(false)}
                className="text-amber-700 text-sm mt-3 hover:underline"
              >
                关闭提醒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: '全部订单', value: stats.total, color: 'var(--foreground)' },
          { label: '待付款', value: stats.pending, color: '#f59e0b', highlight: stats.pending > 0 },
          { label: '已付款', value: stats.paid, color: '#3b82f6' },
          { label: '已发货', value: stats.shipped, color: '#8b5cf6' },
          { label: '已送达', value: stats.delivered, color: '#10b981' },
        ].map((stat) => (
          <div 
            key={stat.label}
            className="bg-white rounded-xl p-5 border"
            style={{ 
              borderColor: stat.highlight ? '#f59e0b' : 'var(--primary-light)',
              boxShadow: stat.highlight ? '0 4px 15px rgba(245,158,11,0.2)' : undefined,
            }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 搜索与筛选 */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6 border" style={{ borderColor: 'var(--primary-light)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2" style={{ fontSize: '1rem' }}>搜索订单</label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2 focus:ring-amber-200"
                style={{ borderColor: 'var(--primary-light)', fontSize: '1rem' }}
                placeholder="客户姓名、电话、订单ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ fontSize: '1rem' }}>状态筛选</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${statusFilter === 'all' ? 'text-white' : 'hover:bg-gray-100'}`}
                  style={{ background: statusFilter === 'all' ? 'var(--primary)' : 'var(--background-secondary)', color: statusFilter === 'all' ? 'white' : 'var(--foreground)' }}
                  onClick={() => setStatusFilter('all')}
                >
                  全部
                </button>
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${statusFilter === opt.value ? 'text-white' : 'hover:bg-gray-100'}`}
                    style={{ background: statusFilter === opt.value ? 'var(--primary)' : 'var(--background-secondary)', color: statusFilter === opt.value ? 'white' : 'var(--foreground)' }}
                    onClick={() => setStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            共 {orders.length} 个订单，筛选后 {filteredOrders.length} 个
          </div>
        </div>
      )}

      {/* 订单列表 */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--foreground-muted)' }}>加载中...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: 'var(--primary-light)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--background-secondary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {orders.length === 0 ? '暂无订单' : '没有匹配的订单'}
          </h3>
          <p style={{ color: 'var(--foreground-muted)' }}>
            {orders.length === 0 ? '尚未有客户下单' : '请尝试其他搜索条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isTimeout = order.status === 'pending' && new Date(order.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition"
                style={{ 
                  borderColor: isTimeout ? '#f59e0b' : 'var(--primary-light)',
                  boxShadow: isTimeout ? '0 4px 15px rgba(245,158,11,0.15)' : undefined,
                }}
              >
                {/* 头部 */}
                <div className="p-5 border-b" style={{ borderColor: 'var(--primary-light)', background: isTimeout ? 'rgba(245,158,11,0.05)' : undefined }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                          订单 #{order.id.substring(0, 12)}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {isTimeout && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          超时未处理
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                      <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-5">
                  {/* 客户信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>客户</div>
                      <div className="font-medium" style={{ fontSize: '1rem' }}>{order.customerName}</div>
                      <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{order.customerPhone}</div>
                    </div>
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>邮箱</div>
                      <div className="font-medium" style={{ fontSize: '1rem' }}>{order.customerEmail || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>收货地址</div>
                      <div className="font-medium text-sm" style={{ fontSize: '0.9375rem' }}>{order.shippingAddress || '-'}</div>
                    </div>
                  </div>

                  {/* 商品列表 */}
                  <div className="mb-6">
                    <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>商品清单</div>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 text-left font-medium">商品</th>
                            <th className="py-2 px-4 text-left font-medium">单价</th>
                            <th className="py-2 px-4 text-left font-medium">数量</th>
                            <th className="py-2 px-4 text-left font-medium">小计</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-gray-200">
                              <td className="py-3 px-4">{item.name}</td>
                              <td className="py-3 px-4">{formatCurrency(item.price)}</td>
                              <td className="py-3 px-4">×{item.quantity}</td>
                              <td className="py-3 px-4 font-medium">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--primary-light)' }}>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openDialog(order.id, 'confirm_payment')}
                          disabled={updating === order.id}
                          className="btn btn-success"
                        >
                          ✓ 确认收款
                        </button>
                        <button
                          onClick={() => openDialog(order.id, 'cancel')}
                          disabled={updating === order.id}
                          className="btn btn-danger"
                        >
                          ✕ 取消订单
                        </button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        disabled={updating === order.id}
                        className="btn btn-primary"
                      >
                        确认发货
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => openDialog(order.id, 'complete')}
                        disabled={updating === order.id}
                        className="btn btn-success"
                      >
                        ✓ 完成订单
                      </button>
                    )}
                    
                    {/* 状态选择器 */}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>快速改状态：</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="px-3 py-2 border rounded-lg text-sm"
                        style={{ borderColor: 'var(--primary-light)' }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {updating === order.id && (
                        <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 刷新按钮 */}
      <div className="text-center mt-8">
        <button
          onClick={fetchOrders}
          className="btn btn-primary"
        >
          刷新订单
        </button>
      </div>

      {/* 确认弹窗 */}
      <ConfirmDialog
        isOpen={dialog?.isOpen || false}
        title={dialog?.title || ''}
        message={dialog?.message || ''}
        confirmText={dialog?.action === 'cancel' ? '确认取消' : '确认'}
        cancelText="返回"
        confirmStyle={dialog?.action === 'cancel' ? 'danger' : dialog?.action === 'complete' ? 'success' : 'primary'}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
