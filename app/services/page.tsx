'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // 分钟
  price: number;
  description: string;
  popularity: number; // 1-5
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '面部护理',
    duration: 60,
    price: 100,
    description: '',
    popularity: 3,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const result = await getServices();
      if (result?.error) {
        throw new Error(result.error);
      }
      setServices(result?.services || []);
    } catch (err: any) {
      setError(err.message || '加载失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('确定删除此服务吗？删除后不可恢复。')) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteService(id);
      if (result.error) throw new Error(result.error);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      alert('请输入服务名称');
      return;
    }
    if (newService.duration <= 0) {
      alert('时长必须大于0');
      return;
    }
    if (newService.price <= 0) {
      alert('价格必须大于0');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createService(newService);
      if (result.error) throw new Error(result.error);
      if (result.service) {
        setServices(prev => [result.service, ...prev]);
      }
      setNewService({
        name: '',
        category: '面部护理',
        duration: 60,
        price: 100,
        description: '',
        popularity: 3,
        is_active: true,
      });
      setShowAddForm(false);
      alert('添加成功！');
    } catch (err: any) {
      alert(`添加失败: ${err.message}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;
    if (!editingService.name.trim()) {
      alert('请输入服务名称');
      return;
    }
    if (editingService.duration <= 0) {
      alert('时长必须大于0');
      return;
    }
    if (editingService.price <= 0) {
      alert('价格必须大于0');
      return;
    }
    setSubmitting(true);
    try {
      const result = await updateService(editingService.id, editingService);
      if (result.error) throw new Error(result.error);
      setServices(prev => prev.map(s => s.id === editingService.id ? editingService : s));
      setEditingService(null);
      alert('更新成功！');
    } catch (err: any) {
      alert(`更新失败: ${err.message}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
    }
    return `${minutes}分钟`;
  };

  const getPopularityStars = (popularity: number) => {
    return '\u2605'.repeat(popularity) + '\u2606'.repeat(5 - popularity);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e8d5b8] to-[#c9a87c] rounded-2xl mb-4">
            <div className="text-3xl"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">服务项目管理</h1>
          <p className="text-gray-600">
            管理所有美容服务项目、定价、时长、分类，灵活配置套餐与促销活动。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchServices()}
            className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            刷新
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#8a6a3a] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAddForm(true)}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '+ 添加服务'}
          </button>
        </div>
      </div>

      {/* 添加服务表单 */}
      {showAddForm && (
        <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">添加新服务</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">服务名称 *</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                placeholder="例如：深层清洁面部护理"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              >
                <option value="面部护理">面部护理</option>
                <option value="身体护理">身体护理</option>
                <option value="手足护理">手足护理</option>
                <option value="美发造型">美发造型</option>
                <option value="美甲美睫">美甲美睫</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">时长（分钟） *</label>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">价格（元） *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                rows={3}
                placeholder="简要描述服务内容、功效、适用人群等"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">热度评分（1-5）</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-2xl ${star <= newService.popularity ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setNewService({ ...newService, popularity: star })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-5 w-5 text-[#a88a5c] focus:ring-[#c9a87c]"
                    checked={newService.is_active}
                    onChange={() => setNewService({ ...newService, is_active: true })}
                  />
                  <span className="ml-2 text-gray-700">上架中</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-5 w-5 text-[#a88a5c] focus:ring-[#c9a87c]"
                    checked={!newService.is_active}
                    onChange={() => setNewService({ ...newService, is_active: false })}
                  />
                  <span className="ml-2 text-gray-700">已下架</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
              onClick={() => setShowAddForm(false)}
              disabled={submitting}
            >
              取消
            </button>
            <button
              className="px-8 py-3 bg-gradient-to-r from-[#c9a87c] to-[#8a6a3a] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddService}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认添加'}
            </button>
          </div>
        </div>
      )}

      {/* 编辑服务表单 */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">编辑服务</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">服务名称 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                  placeholder="例如：深层清洁面部护理"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                >
                  <option value="面部护理">面部护理</option>
                  <option value="身体护理">身体护理</option>
                  <option value="手足护理">手足护理</option>
                  <option value="美发造型">美发造型</option>
                  <option value="美甲美睫">美甲美睫</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">时长（分钟） *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                  value={editingService.duration}
                  onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">价格（元） *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-[#c9a87c] outline-none transition"
                  rows={3}
                  placeholder="简要描述服务内容、功效、适用人群等"
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">热度评分（1-5）</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-2xl ${star <= editingService.popularity ? 'text-yellow-500' : 'text-gray-300'}`}
                      onClick={() => setEditingService({ ...editingService, popularity: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-5 w-5 text-[#a88a5c] focus:ring-[#c9a87c]"
                      checked={editingService.is_active}
                      onChange={() => setEditingService({ ...editingService, is_active: true })}
                    />
                    <span className="ml-2 text-gray-700">上架中</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-5 w-5 text-[#a88a5c] focus:ring-[#c9a87c]"
                      checked={!editingService.is_active}
                      onChange={() => setEditingService({ ...editingService, is_active: false })}
                    />
                    <span className="ml-2 text-gray-700">已下架</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
                onClick={() => setEditingService(null)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-[#c9a87c] to-[#8a6a3a] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEditService}
                disabled={submitting}
              >
                {submitting ? '更新中...' : '确认更新'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {['服务名称', '分类', '时长', '价格', '热度', '状态', '操作'].map((col) => (
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
                      <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
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
              <div key={i} className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
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
            onClick={fetchServices}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition"
          >
            重试
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-gradient-to-r from-[#e8d5b8]/30 to-[#c9a87c]/30 border border-[#e8d5b8] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-6"></div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">暂无服务项目</h3>
          <p className="text-gray-700 max-w-md mx-auto mb-6">
            您尚未添加任何服务项目。点击“添加服务”按钮开始创建您的服务目录。
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-[#c9a87c] to-[#8a6a3a] text-white font-semibold rounded-lg hover:opacity-90 transition"
            onClick={() => alert('添加服务功能即将上线')}
          >
            + 添加第一个服务
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">服务名称</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">分类</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">时长</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">价格</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">热度</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">状态</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${service.category === '面部护理' ? 'bg-cyan-100 text-cyan-800' : service.category === '身体护理' ? 'bg-green-100 text-green-800' : 'bg-[#faf8f5] text-purple-800'}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {formatDuration(service.duration)}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="py-4 px-6 text-yellow-600 text-sm">
                        {getPopularityStars(service.popularity)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {service.is_active ? '上架中' : '已下架'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-[#e8d5b8]/30 text-[#8a6a3a] text-sm font-medium rounded-lg hover:bg-[#e8d5b8]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setEditingService(service)}
                            disabled={submitting}
                          >
                            编辑
                          </button>
                          <button
                            className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteService(service.id)}
                            disabled={deletingId === service.id}
                          >
                            {deletingId === service.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#e8d5b8]/30 to-[#c9a87c]/30 border border-[#e8d5b8] rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">服务总览</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2"></div>
                <div className="text-3xl font-bold text-gray-900">{services.length}</div>
                <div className="text-sm text-gray-600">服务总数</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2"></div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(services.reduce((sum, s) => sum + s.price, 0))}
                </div>
                <div className="text-sm text-gray-600">总定价</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatDuration(services.reduce((sum, s) => sum + s.duration, 0))}
                </div>
                <div className="text-sm text-gray-600">总时长</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2 font-bold text-[#c9a87c]">*</div>
                <div className="text-3xl font-bold text-gray-900">
                  {(services.reduce((sum, s) => sum + s.popularity, 0) / services.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均热度</div>
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