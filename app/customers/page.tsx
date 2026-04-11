'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  membership_level: string;
  total_spent: number;
  last_visit: string;
  notes?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      const result = await response.json();
      setCustomers(result.customers || []);
    } catch (err: any) {
      setError(err.message || '加载失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl mb-4">
            <div className="text-3xl">👥</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">客户管理</h1>
          <p className="text-gray-600">
            集中管理所有客户信息、消费记录、会员等级，实现精准客户关系维护。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchCustomers()}
            className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            刷新
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            onClick={() => alert('添加客户功能即将上线')}
          >
            + 添加客户
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          {/* 标题骨架 */}
          <div className="h-10 w-64 bg-gray-300 rounded-xl"></div>
          {/* 表格骨架 */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['客户姓名', '联系方式', '会员等级', '累计消费', '最近到店', '操作'].map((col) => (
                      <th key={col} className="py-4 px-6 text-left">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* 统计卡片骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm">
                <div className="h-8 w-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-800">加载失败</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchCustomers}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition"
          >
            重试
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-6">👤</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">暂无客户数据</h3>
          <p className="text-gray-700 max-w-md mx-auto mb-6">
            您尚未添加任何客户。点击“添加客户”按钮开始建立您的客户档案。
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            onClick={() => alert('添加客户功能即将上线')}
          >
            + 添加第一个客户
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">客户姓名</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">联系方式</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">会员等级</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">累计消费</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">最近到店</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.notes && (
                          <div className="text-sm text-gray-500 mt-1">{customer.notes}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{customer.phone}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${customer.membership_level === '钻石会员' ? 'bg-purple-100 text-purple-800' : customer.membership_level === '黄金会员' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {customer.membership_level}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {formatDate(customer.last_visit)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-cyan-50 text-cyan-700 text-sm font-medium rounded-lg hover:bg-cyan-100 transition"
                            onClick={() => alert(`编辑 ${customer.name}`)}
                          >
                            编辑
                          </button>
                          <button
                            className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition"
                            onClick={() => {
                              if (confirm(`确定删除客户 "${customer.name}" 吗？`)) {
                                alert(`删除 ${customer.name}（功能开发中）`);
                              }
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">客户总览</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
                <div className="text-sm text-gray-600">客户总数</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
                </div>
                <div className="text-sm text-gray-600">累计消费</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm">
                <div className="text-2xl mb-2">👑</div>
                <div className="text-3xl font-bold text-gray-900">
                  {customers.filter(c => c.membership_level === '钻石会员').length}
                </div>
                <div className="text-sm text-gray-600">钻石会员</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-cyan-300 shadow-sm">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-3xl font-bold text-gray-900">
                  {customers.filter(c => {
                    const lastVisit = new Date(c.last_visit);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return lastVisit >= thirtyDaysAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">30天内到店</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回仪表板
        </Link>
      </div>
    </div>
  );
}