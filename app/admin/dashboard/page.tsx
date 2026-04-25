'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { getOrders, getProducts, getCustomers } from '@/lib/api';

const COLORS = ['#c9a87c', '#2d4a3e', '#8b7355', '#d4a574', '#5a8c7f', '#a88a5c'];

export default function AdminDashboardPage() {
    useEffect(() => { document.title = '绠＄悊鍚庡彴 - 涓藉Э绉€'; }, []);

const { role } = useAuth();
  const router = useRouter();
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">姝ｅ湪妫€鏌ユ潈闄?..</p>
        </div>
      </div>
    );
  }
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0,
    pendingOrders: 0, lowStockProducts: 0, monthRevenue: 0, monthOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        getOrders(),
        getProducts(),
        getCustomers(),
      ]);
      const orders = ordersRes?.orders || [];
      const products = productsRes?.products || [];
      const customers = customersRes?.customers || [];

      const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
      const paidOrders = orders.filter((o: any) => o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped');
      const monthRevenue = paidOrders.reduce((s: number, o: any) => {
        const d = new Date(o.createdAt);
        const now = new Date();
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return s + (o.total || 0);
        return s;
      }, 0);
      const monthOrders = paidOrders.filter((o: any) => {
        const d = new Date(o.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // 鏈€杩戣鍗曪紙鏈€鏂?鏉★級
      setRecentOrders([...orders].reverse().slice(0, 5));

      // 鏀跺叆瓒嬪娍锛堟渶杩?澶╋級
      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        dayMap[key] = 0;
      }
      paidOrders.forEach((o: any) => {
        const d = new Date(o.createdAt);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (key in dayMap) dayMap[key] += o.total || 0;
      });
      setRevenueData(Object.entries(dayMap).map(([date, amount]) => ({ date, amount })));

      // 鍟嗗搧鍒嗙被缁熻
      const catMap: Record<string, number> = {};
      products.forEach((p: any) => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: customers.length,
        totalProducts: products.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        lowStockProducts: products.filter((p: any) => p.stock <= 10).length,
        monthRevenue,
        monthOrders,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', paid: 'bg-[#c9a87c]/20 text-[#8b7355]',
    shipped: 'bg-[#c9a87c] text-white', delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusLabel: Record<string, string> = {
    pending: '寰呬粯娆?, paid: '宸蹭粯娆?, shipped: '宸插彂璐?,
    delivered: '宸查€佽揪', cancelled: '宸插彇娑?,
  };

  const statCards = [
    { label: '鎬绘敹鍏?, value: fmt(stats.totalRevenue), color: 'from-[#c9a87c] to-[#e8d5b8]', sub: '鍘嗗彶绱', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { label: '鏈湀鏀跺叆', value: fmt(stats.monthRevenue), color: 'from-[#2d4a3e] to-[#4a7c6f]', sub: `鏈湀 ${stats.monthOrders} 绗擿, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
    { label: '鎬昏鍗?, value: `${stats.totalOrders} 绗擿, color: 'from-[#2d4a3e] to-[#5a8c7f]', sub: `寰呭鐞?${stats.pendingOrders}`, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { label: '瀹㈡埛鎬绘暟', value: `${stats.totalCustomers} 浜篳, color: 'from-[#c9a87c] to-[#e8d5b8]', sub: '娉ㄥ唽鐢ㄦ埛', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: '鍟嗗搧鎬绘暟', value: `${stats.totalProducts} 涓猔, color: 'from-[#c9a87c] to-[#e8d5b8]', sub: `搴撳瓨绱у紶 ${stats.lowStockProducts}`, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { label: '骞冲潎瀹㈠崟浠?, value: stats.totalOrders > 0 ? fmt(stats.totalRevenue / stats.totalOrders) : fmt(0), color: 'from-[#8b7355] to-[#c9a87c]', sub: '姣忕瑪璁㈠崟', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">鏁版嵁闈㈡澘</h1>
          <p className="text-gray-500 mt-1">瀹炴椂鎺屾彙搴楅摵杩愯惀鏁版嵁</p>
        </div>
        <button onClick={fetchDashboardData} disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
          {loading ? '鍒锋柊涓?..' : ' 鍒锋柊鏁版嵁'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <>
          {/* 缁熻鍗＄墖 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="mb-2">{card.svg}</div>
                <div className="text-sm font-medium opacity-80">{card.label}</div>
                <div className="text-xl font-bold mt-1 truncate">{card.value}</div>
                <div className="text-sm opacity-70 mt-1">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* 鍥捐〃鍖?*/}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 鏀跺叆瓒嬪娍 */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5"> 杩?澶╂敹鍏ヨ秼鍔?/h2>
              {revenueData.length > 0 && revenueData.some(d => d.amount > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `楼${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip formatter={(v: any) => [`楼${v.toFixed(2)}`, '鏀跺叆']} />
                    <Bar dataKey="amount" fill="#c9a87c" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">鏆傛棤鏀跺叆鏁版嵁</div>
              )}
            </div>

            {/* 璁㈠崟鐘舵€佸垎甯?*/}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">璁㈠崟鐘舵€佸垎甯?/h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={[
                      { name: '寰呬粯娆?, value: stats.pendingOrders },
                      { name: '宸蹭粯娆?, value: stats.totalOrders - stats.pendingOrders },
                    ]} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                      {[{ name: '寰呬粯娆?, value: stats.pendingOrders }, { name: '宸插鐞?, value: stats.totalOrders - stats.pendingOrders }].map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {[
                    { label: '寰呬粯娆?, value: stats.pendingOrders, color: 'bg-yellow-400' },
                    { label: '宸插鐞?, value: stats.totalOrders - stats.pendingOrders, color: 'bg-[#c9a87c]' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-base text-gray-700">{item.label}</span>
                      <span className="text-base font-bold text-gray-900 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 鍟嗗搧鍒嗙被 */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">鍟嗗搧鍒嗙被鍒嗗竷</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#c9a87c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 鏈€杩戣鍗?*/}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">鏈€杩戣鍗?/h2>
              <Link href="/admin/orders" className="text-[#a88a5c] text-base font-medium hover:underline">鍏ㄩ儴璁㈠崟 鈫?/Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">鏆傛棤璁㈠崟鏁版嵁</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">璁㈠崟鍙?/th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">瀹㈡埛</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">閲戦</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">鐘舵€?/th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">鏃堕棿</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono text-sm text-gray-500">#{o.id.substring(0, 10)}</td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-gray-900">{o.customerName || '鈥?}</div>
                          <div className="text-sm text-gray-500">{o.customerPhone || '鈥?}</div>
                        </td>
                        <td className="py-3 px-2 font-bold text-gray-900">{fmt(o.total || 0)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>
                            {statusLabel[o.status] || o.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-sm">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '鈥?}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 搴撳瓨棰勮 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">杩愯惀鎻愰啋</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <div className="text-[#c9a87c] font-bold text-xl mb-0.5">{stats.lowStockProducts}</div>
                <div className="text-gray-700 font-medium">搴撳瓨绱у紶鍟嗗搧</div>
                <div className="text-gray-500 text-sm mt-1">搴撳瓨 鈮?10 浠?/div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <div className="text-yellow-500 font-bold text-xl mb-0.5">{stats.pendingOrders}</div>
                <div className="text-gray-700 font-medium">寰呭鐞嗚鍗?/div>
                <div className="text-gray-500 text-sm mt-1">绛夊緟瀹㈡埛浠樻</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <div className="text-blue-500 font-bold text-xl mb-0.5">{stats.totalProducts}</div>
                <div className="text-gray-700 font-medium">鍦ㄥ敭鍟嗗搧</div>
                <div className="text-gray-500 text-sm mt-1">寤鸿瀹氭湡鏇存柊搴撳瓨</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 蹇€熷叆鍙?*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/orders', label: '璁㈠崟绠＄悊', color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
          { href: '/admin/products', label: '浜у搧绠＄悊', color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
          { href: '/customers', label: '瀹㈡埛绠＄悊', color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { href: '/calendar', label: '棰勭害鏃ュ巻', color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-6 text-center hover:shadow-lg transition`}>
            <div className="mb-3 flex justify-center">{item.svg}</div>
            <div className="font-bold">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
