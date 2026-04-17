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



export default function AdminOrdersPage() {
  const { role } = useAuth();
  const router = useRouter();
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

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'



  useEffect(() => {

    fetchOrders();

  }, []);



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



  // 过滤订单

  const filteredOrders = orders.filter(order => {

    // 搜索词过滤（客户姓名、电话、邮箱、订单ID）

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

    // 状态过滤

    if (statusFilter !== 'all' && order.status !== statusFilter) {

      return false;

    }

    return true;

  });



  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {

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

      case 'paid': return 'bg-blue-100 text-blue-800';

      case 'shipped': return 'bg-[#faf8f5] text-purple-800';

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



  return (

    <div className="max-w-7xl mx-auto px-4 py-12">

      <div className="text-center mb-12">

        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#c9a87c]/10 to-[#e8d5b8]/10 rounded-2xl mb-6">

          <div className="text-3xl"></div>

        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">商家订单管理</h1>

        <p className="text-gray-600 max-w-2xl mx-auto">

          查看所有订单，管理订单状态，跟踪销售情况。

        </p>

      </div>



      {/* 搜索与筛选面板 */}

      {!loading && orders.length > 0 && (

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">搜索订单</label>

              <input

                type="text"

                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"

                placeholder="输入客户姓名、电话、邮箱、订单ID或商品名称"

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">状态筛选</label>

              <div className="flex flex-wrap gap-2">

                <button

                  className={`px-4 py-2 rounded-lg font-medium text-sm ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}

                  onClick={() => setStatusFilter('all')}

                >

                  全部

                </button>

                {statusOptions.map(opt => (

                  <button

                    key={opt.value}

                    className={`px-4 py-2 rounded-lg font-medium text-sm ${statusFilter === opt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}

                    onClick={() => setStatusFilter(opt.value)}

                  >

                    {opt.label}

                  </button>

                ))}

              </div>

            </div>

          </div>

          <div className="mt-4 text-sm text-gray-600">

            共 {orders.length} 个订单，筛选后 {filteredOrders.length} 个

          </div>

        </div>

      )}



      {loading ? (

        <div className="text-center py-16">

          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>

          <p className="text-gray-600">加载订单中...</p>

        </div>

      ) : filteredOrders.length === 0 ? (

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-16 text-center">

          <div className="text-6xl mb-6"></div>

          <h3 className="text-2xl font-bold text-gray-800 mb-4">

            {orders.length === 0 ? '暂无订单' : '没有匹配的订单'}

          </h3>

          <p className="text-gray-600 max-w-md mx-auto">

            {orders.length === 0

              ? '尚未有客户下单，快去推广您的产品吧！'

              : '请尝试其他搜索词或筛选条件。'}

          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {filteredOrders.map(order => (

            <div

              key={order.id}

              className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition"

            >

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">

                <div>

                  <h3 className="text-xl font-bold text-gray-900">订单 #{order.id.substring(0, 12)}</h3>

                  <p className="text-gray-600 mt-1">客户：{order.customerName} · {order.customerPhone}</p>

                  <p className="text-gray-600">创建时间：{formatDate(order.createdAt)}</p>

                  {order.customerEmail && (

                    <p className="text-gray-600">邮箱：{order.customerEmail}</p>

                  )}

                </div>

                <div className="flex items-center space-x-4 mt-4 md:mt-0">

                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>

                    {translateStatus(order.status)}

                  </span>

                  <div className="text-2xl font-bold text-gray-900">

                    {formatCurrency(order.total)}

                  </div>

                </div>

              </div>



              <div className="mb-6">

                <h4 className="font-bold text-gray-900 mb-2">收货地址</h4>

                <p className="text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>

              </div>



              <div className="mb-8">

                <h4 className="font-bold text-gray-900 mb-4">商品清单</h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="py-3 px-4 text-left font-bold text-gray-900">商品</th>

                        <th className="py-3 px-4 text-left font-bold text-gray-900">单价</th>

                        <th className="py-3 px-4 text-left font-bold text-gray-900">数量</th>

                        <th className="py-3 px-4 text-left font-bold text-gray-900">小计</th>

                      </tr>

                    </thead>

                    <tbody>

                      {order.items.map((item, idx) => (

                        <tr key={idx} className="border-t border-gray-200">

                          <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>

                          <td className="py-4 px-4">{formatCurrency(item.price)}</td>

                          <td className="py-4 px-4">{item.quantity}</td>

                          <td className="py-4 px-4 font-bold">{formatCurrency(item.price * item.quantity)}</td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>



              <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 border-t border-gray-200">

                <div className="flex items-center space-x-4 mb-4 md:mb-0">

                  <span className="text-gray-900 font-bold">订单总额：</span>

                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</span>

                  <div className="text-gray-600">

                    （含运费 {order.shippingFee === 0 ? '免费' : formatCurrency(order.shippingFee)}）

                  </div>

                </div>

                <div className="flex items-center space-x-4">

                  <label htmlFor={`status-${order.id}`} className="font-bold text-gray-900">状态更新：</label>

                  <select

                    id={`status-${order.id}`}

                    value={order.status}

                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}

                    disabled={updating === order.id}

                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"

                  >

                    {statusOptions.map(opt => (

                      <option key={opt.value} value={opt.value}>{opt.label}</option>

                    ))}

                  </select>

                  {updating === order.id && (

                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}



      <div className="text-center mt-12">

        <button

          onClick={fetchOrders}

          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#b8956a] text-white font-semibold rounded-lg hover:opacity-90 transition"

        >

           刷新订单列表

        </button>

      </div>



      <div className="mt-12 p-6 bg-gradient-to-r from-[#c9a87c]/5 to-[#e8d5b8]/5 border border-blue-200 rounded-2xl">

        <h3 className="text-xl font-bold text-gray-900 mb-4">商家操作说明</h3>

        <ul className="space-y-2 text-gray-700">

          <li>• 订单状态分为：待付款、已付款、已发货、已送达、已取消</li>

          <li>• 客户支付后，请将状态改为“已付款”</li>

          <li>• 发货后请更新为“已发货”，客户收货后改为“已送达”</li>

          <li>• 若订单取消，请选择“已取消”状态</li>

          <li>• 状态更新会实时反映在客户订单页面</li>

          <li>• 当前数据存储在内存中，页面刷新会重置，正式环境请连接数据库</li>

        </ul>

      </div>

    </div>

  );

}