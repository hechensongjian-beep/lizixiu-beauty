'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

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
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  
    useEffect(() => { document.title = '鎴戠殑璁㈠崟 - 涓藉Э绉€';
    getOrders()
      .then(data => {
        setOrders(data?.orders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('鑾峰彇璁㈠崟澶辫触', err);
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-[#c9a87c]/20 text-[#8b7355]';
      case 'shipped': return 'bg-[#c9a87c] text-white';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: '寰呬粯娆?,
      paid: '宸蹭粯娆?,
      shipped: '宸插彂璐?,
      delivered: '宸查€佽揪',
      cancelled: '宸插彇娑?,
    };
    return map[status] || status;
  };


  const cancelOrder = async (orderId: string) => {
    if (!confirm('纭畾瑕佸彇娑堣繖涓鍗曞悧锛?)) return;
    try {
      const result = await updateOrderStatus(orderId, 'cancelled');
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      } else {
        alert(result.error || '鍙栨秷澶辫触锛岃閲嶈瘯');
      }
    } catch {
      alert('缃戠粶閿欒锛岃閲嶈瘯');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#c9a87c]/10 to-[#e8d5b8]/10 rounded-2xl mb-6">
          <div className="text-xl"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
        </div>
        <h1 className="font-bold mb-4">鎴戠殑璁㈠崟</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          鏌ョ湅鎮ㄧ殑鎵€鏈夎鍗曡褰曚笌鐘舵€併€?        </p>
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-10 w-48 rounded-lg animate-pulse bg-gray-200 mb-8"></div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      ) : orders.length === 0 && role === 'guest' ? (
        <div className="bg-[#faf8f5] border border-gray-200 rounded-2xl p-16 text-center">
          <div className="mb-6 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <h3 className="font-bold mb-3" style={{color:'#2a2a28'}}>鏌ョ湅鎴戠殑璁㈠崟</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            鐧诲綍鍚庡嵆鍙煡鐪嬫偍鐨勬墍鏈夎鍗曡褰?          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/login" className="px-8 py-3 rounded-full text-white font-bold text-sm" style={{background:'linear-gradient(135deg, #c9a87c, #b8956a)',boxShadow:'0 4px 16px rgba(201,168,124,0.3)'}}>
              鐧诲綍 / 娉ㄥ唽
            </Link>
            <Link href="/products" className="px-8 py-3 rounded-full font-bold text-sm" style={{border:'1px solid #e8d5b8',color:'#a88a5c'}}>
              鍏堝幓閫涢€?            </Link>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#faf8f5] border border-gray-200 rounded-2xl p-16 text-center">
          <div className="mb-6 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c0bdb8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <h3 className="font-bold mb-4">鏆傛棤璁㈠崟</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            鎮ㄨ繕娌℃湁鍒涘缓浠讳綍璁㈠崟銆傚揩鍘讳骇鍝佸晢搴楅€涢€涘惂锛?          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
          >
             鍘讳骇鍝佸晢搴?          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition"
            >
              {/* 璁㈠崟澶撮儴 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="font-bold">璁㈠崟 #{order.id.substring(0, 12)}</h3>
                  <p className="text-base text-gray-600 mt-2">鍒涘缓浜?{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`} style={{fontSize:'1rem'}}>
                    {translateStatus(order.status)}
                  </span>
                  <div className="font-bold">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              </div>

              {/* 瀹㈡埛淇℃伅 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">瀹㈡埛淇℃伅</h4>
                  <p className="text-base text-gray-700">{order.customerName}</p>
                  <p className="text-base text-gray-700">{order.customerPhone}</p>
                  {order.customerEmail && (
                    <p className="text-base text-gray-700">{order.customerEmail}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">鏀惰揣鍦板潃</h4>
                  <p className="text-base text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              </div>

              {/* 鍟嗗搧鍒楄〃 */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">鍟嗗搧娓呭崟</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-bold text-gray-900" style={{fontSize:'1rem'}}>鍟嗗搧</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-900" style={{fontSize:'1rem'}}>鍗曚环</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-900" style={{fontSize:'1rem'}}>鏁伴噺</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-900" style={{fontSize:'1rem'}}>灏忚</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="py-4 px-4 font-medium text-gray-900" style={{fontSize:'1rem'}}>{item.name}</td>
                          <td className="py-4 px-4" style={{fontSize:'1rem'}}>{formatCurrency(item.price)}</td>
                          <td className="py-4 px-4" style={{fontSize:'1rem'}}>{item.quantity}</td>
                          <td className="py-4 px-4 font-bold" style={{fontSize:'1rem'}}>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 璁㈠崟鎽樿 */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">鍟嗗搧灏忚</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">杩愯垂</span>
                      <span className="font-medium">
                        {order.shippingFee === 0 ? '鍏嶈垂' : formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">绋庤垂</span>
                      <span className="font-medium">{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>鎬昏</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 鎿嶄綔鎸夐挳 */}
              <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { window.location.href = '/checkout'; }}
                      className="px-6 py-3 bg-gradient-to-r from-[#2d4a3e] to-[#3d6252] text-white font-bold rounded-lg hover:opacity-90 transition"
                    >
                      绔嬪嵆鏀粯
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-6 py-3 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition"
                    >
                      鍙栨秷璁㈠崟
                    </button>
                  </>
                )}
                <button
                  onClick={() => { alert('璁㈠崟璇︽儏锛? + order.id.substring(0, 12)); }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  鏌ョ湅璇︽儏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 杩斿洖閾炬帴 */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#2d4a3e] text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          鈫?杩斿洖涓婚〉
        </Link>
      </div>
    </div>
  );
}