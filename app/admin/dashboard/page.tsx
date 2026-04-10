'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();

      const orders = ordersData.orders || [];
      const products = productsData.products || [];

      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const lowStockProducts = products.filter((p: any) => p.stock <= 10).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: new Set(orders.map((o: any) => o.customerEmail)).size,
        totalProducts: products.length,
        pendingOrders,
        lowStockProducts,
      });

      // 最近5个订单
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('加载仪表板数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-6"></div>
        <p className="text-gray-600">加载仪表板数据中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl mb-6">
          <div className="text-3xl">📈</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">数据面板</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          实时监控您的店铺运营数据，掌握销售趋势与库存状态。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">总销售额</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <div className="mt-4 text-sm text-gray-600">历史累计收入</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">总订单数</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders} 笔</p>
          <div className="mt-4 text-sm text-gray-600">待处理：{stats.pendingOrders} 笔</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">客户总数</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers} 人</p>
          <div className="mt-4 text-sm text-gray-600">去重客户邮箱数</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">商品总数</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProducts} 个</p>
          <div className="mt-4 text-sm text-gray-600">库存紧张：{stats.lowStockProducts} 个</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">平均订单额</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : formatCurrency(0)}
          </p>
          <div className="mt-4 text-sm text-gray-600">每笔订单平均消费</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">⏱️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">实时数据</h3>
          <p className="text-3xl font-bold text-gray-900">实时</p>
          <div className="mt-4 text-sm text-gray-600">内存存储，刷新重置</div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">最近订单</h2>
          <Link
            href="/admin/orders"
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            查看全部订单
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left font-bold text-gray-900">订单号</th>
                <th className="py-3 px-4 text-left font-bold text-gray-900">客户</th>
                <th className="py-3 px-4 text-left font-bold text-gray-900">金额</th>
                <th className="py-3 px-4 text-left font-bold text-gray-900">状态</th>
                <th className="py-3 px-4 text-left font-bold text-gray-900">时间</th>
                <th className="py-3 px-4 text-left font-bold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">#{order.id.substring(0, 12)}</td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-600">{order.customerPhone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {translateStatus(order.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{formatDate(order.createdAt)}</td>
                  <td className="py-4 px-4">
                    <Link
                      href={`/admin/orders`}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition"
                    >
                      管理
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">暂无订单</h3>
            <p className="text-gray-600">尚未有客户下单，快去推广您的产品吧！</p>
          </div>
        )}
      </div>

      {/* 库存预警 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">库存预警</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-amber-200 rounded-xl p-6">
            <div className="text-3xl mb-4">🟡</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">库存紧张商品</h3>
            <p className="text-3xl font-bold text-amber-700">{stats.lowStockProducts} 个</p>
            <p className="mt-2 text-sm text-gray-600">库存 ≤ 10 件的商品</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-6">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">待处理订单</h3>
            <p className="text-3xl font-bold text-amber-700">{stats.pendingOrders} 笔</p>
            <p className="mt-2 text-sm text-gray-600">状态为“待付款”的订单</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-6">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">建议补货</h3>
            <p className="text-3xl font-bold text-amber-700">立即检查</p>
            <p className="mt-2 text-sm text-gray-600">前往产品管理页面查看详情</p>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">订单管理</h3>
          <p className="text-gray-600">处理订单，更新状态</p>
        </Link>
        <Link
          href="/admin/products"
          className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">产品管理</h3>
          <p className="text-gray-600">管理商品库存与分类</p>
        </Link>
        <Link
          href="/customers"
          className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">客户管理</h3>
          <p className="text-gray-600">查看客户信息与历史</p>
        </Link>
        <Link
          href="/services"
          className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">💅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">服务管理</h3>
          <p className="text-gray-600">管理美容服务项目</p>
        </Link>
      </div>

      {/* 数据说明 */}
      <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 数据说明</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• 所有数据基于内存存储，刷新页面或重启服务后会重置。</li>
          <li>• 正式环境请连接 Supabase 数据库，启用持久化存储。</li>
          <li>• 如需更详细的报表分析，可扩展数据分析模块。</li>
          <li>• 实时库存扣减已生效，下单后库存立即减少。</li>
          <li>• 商家后台所有功能均可操作，但数据不会永久保存。</li>
        </ul>
      </div>
    </div>
  );
}