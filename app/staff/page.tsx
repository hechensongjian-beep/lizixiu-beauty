'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/lib/api';

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  specialties?: string[];
  experience_years?: number;
  is_active?: boolean;
  avatar_color?: string; // 用于头像背景
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '美容师',
    phone: '',
    email: '',
    specialties: [] as string[],
    experience_years: 1,
    is_active: true,
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const result = await getStaff();
      if (result?.error) throw new Error(result.error);
      setStaff(result?.staff || []);
    } catch (err: any) {
      setError(err.message || '加载失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('确定删除此员工吗？删除后不可恢复。')) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteStaff(id);
      if (result.error) throw new Error(result.error);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name.trim()) {
      alert('请输入员工姓名');
      return;
    }
    if (!newStaff.role.trim()) {
      alert('请输入员工角色');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createStaff(newStaff);
      if (result.error) throw new Error(result.error);
      if (result.staff) setStaff(prev => [result.staff, ...prev]);
      setNewStaff({
        name: '',
        role: '美容师',
        phone: '',
        email: '',
        specialties: [],
        experience_years: 1,
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

  const handleEditStaff = async () => {
    if (!editingStaff) return;
    if (!editingStaff.name.trim()) {
      alert('请输入员工姓名');
      return;
    }
    if (!editingStaff.role.trim()) {
      alert('请输入员工角色');
      return;
    }
    setSubmitting(true);
    try {
      const result = await updateStaff(editingStaff.id, {
        name: editingStaff.name,
        role: editingStaff.role,
        phone: editingStaff.phone || '',
        email: editingStaff.email || '',
        specialties: editingStaff.specialties || [],
        experience_years: editingStaff.experience_years || 0,
        is_active: editingStaff.is_active ?? true,
      });
      if (result.error) throw new Error(result.error);
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...editingStaff } : s));
      setEditingStaff(null);
      alert('更新成功！');
    } catch (err: any) {
      alert(`更新失败: ${err.message}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-cyan-100 to-blue-100',
      'from-[#e8d5b8] to-[#c9a87c]',
      'from-green-100 to-emerald-100',
      'from-amber-100 to-orange-100',
      'from-[#e8d5b8] to-[#f5ede0]',
      'from-red-100 to-orange-100',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e8d5b8] to-[#f5ede0] rounded-2xl mb-4">
            <div className="text-3xl">‍</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">员工管理</h1>
          <p className="text-gray-600">
            管理员工信息、排班、绩效、提成，实现高效团队协作与人力资源优化。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchStaff()}
            className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            刷新
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAddForm(true)}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '+ 添加员工'}
          </button>
        </div>
      </div>

      {/* 添加员工表单 */}
      {showAddForm && (
        <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">添加新员工</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="例如：张晓美"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">角色 *</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="美容师">美容师</option>
                <option value="美甲师">美甲师</option>
                <option value="美发师">美发师</option>
                <option value="店长">店长</option>
                <option value="前台">前台</option>
                <option value="顾问">顾问</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="13800138000"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="example@example.com"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">专长领域</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newStaff.specialties.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#faf8f5] text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                    {spec}
                    <button
                      type="button"
                      className="text-purple-800 hover:text-purple-900"
                      onClick={() => setNewStaff({ ...newStaff, specialties: newStaff.specialties.filter((_, i) => i !== idx) })}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="输入专长后按回车添加"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && specialtyInput.trim()) {
                      if (!newStaff.specialties.includes(specialtyInput.trim())) {
                        setNewStaff({ ...newStaff, specialties: [...newStaff.specialties, specialtyInput.trim()] });
                      }
                      setSpecialtyInput('');
                      e.preventDefault();
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-[#faf8f5] text-[#a88a5c] font-medium rounded-lg hover:bg-purple-200 transition"
                  onClick={() => {
                    if (specialtyInput.trim() && !newStaff.specialties.includes(specialtyInput.trim())) {
                      setNewStaff({ ...newStaff, specialties: [...newStaff.specialties, specialtyInput.trim()] });
                      setSpecialtyInput('');
                    }
                  }}
                >
                  添加
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">工作经验（年）</label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                value={newStaff.experience_years}
                onChange={(e) => setNewStaff({ ...newStaff, experience_years: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-5 w-5 text-[#a88a5c] focus:ring-purple-500"
                    checked={newStaff.is_active}
                    onChange={() => setNewStaff({ ...newStaff, is_active: true })}
                  />
                  <span className="ml-2 text-gray-700">在职</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-5 w-5 text-[#a88a5c] focus:ring-purple-500"
                    checked={!newStaff.is_active}
                    onChange={() => setNewStaff({ ...newStaff, is_active: false })}
                  />
                  <span className="ml-2 text-gray-700">离职</span>
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
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddStaff}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认添加'}
            </button>
          </div>
        </div>
      )}

      {/* 编辑员工表单 */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">编辑员工</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="例如：张晓美"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">角色 *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                >
                  <option value="美容师">美容师</option>
                  <option value="美甲师">美甲师</option>
                  <option value="美发师">美发师</option>
                  <option value="店长">店长</option>
                  <option value="前台">前台</option>
                  <option value="顾问">顾问</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="13800138000"
                  value={editingStaff.phone || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="example@example.com"
                  value={editingStaff.email || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">专长领域</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editingStaff.specialties || []).map((spec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#faf8f5] text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                      {spec}
                      <button
                        type="button"
                        className="text-purple-800 hover:text-purple-900"
                        onClick={() => setEditingStaff({
                          ...editingStaff,
                          specialties: (editingStaff.specialties || []).filter((_, i) => i !== idx)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    placeholder="输入专长后按回车添加"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && specialtyInput.trim()) {
                        if (!editingStaff.specialties?.includes(specialtyInput.trim())) {
                          setEditingStaff({
                            ...editingStaff,
                            specialties: [...(editingStaff.specialties || []), specialtyInput.trim()]
                          });
                        }
                        setSpecialtyInput('');
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-[#faf8f5] text-[#a88a5c] font-medium rounded-lg hover:bg-purple-200 transition"
                    onClick={() => {
                      if (specialtyInput.trim() && !editingStaff.specialties?.includes(specialtyInput.trim())) {
                        setEditingStaff({
                          ...editingStaff,
                          specialties: [...(editingStaff.specialties || []), specialtyInput.trim()]
                        });
                        setSpecialtyInput('');
                      }
                    }}
                  >
                    添加
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工作经验（年）</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={editingStaff.experience_years || 0}
                  onChange={(e) => setEditingStaff({ ...editingStaff, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-5 w-5 text-[#a88a5c] focus:ring-purple-500"
                      checked={editingStaff.is_active ?? true}
                      onChange={() => setEditingStaff({ ...editingStaff, is_active: true })}
                    />
                    <span className="ml-2 text-gray-700">在职</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-5 w-5 text-[#a88a5c] focus:ring-purple-500"
                      checked={!(editingStaff.is_active ?? true)}
                      onChange={() => setEditingStaff({ ...editingStaff, is_active: false })}
                    />
                    <span className="ml-2 text-gray-700">离职</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
                onClick={() => setEditingStaff(null)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEditStaff}
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
          {/* 员工卡片网格骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <div className="h-6 w-32 bg-gray-300 rounded mx-auto mb-4"></div>
                <div className="h-4 w-24 bg-gray-300 rounded mx-auto mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="flex gap-2 justify-center">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
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
            <div className="text-red-600 text-xl mr-3 font-bold">!</div>
            <div>
              <h3 className="font-semibold text-red-800">加载失败</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchStaff}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition"
          >
            重试
          </button>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-[#e8d5b8] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-6"></div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">暂无员工数据</h3>
          <p className="text-gray-700 max-w-md mx-auto mb-6">
            您尚未添加任何员工。点击“添加员工”按钮开始建立您的团队。
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAddForm(true)}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '+ 添加第一个员工'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {staff.map((person, index) => (
              <div
                key={person.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition text-center"
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-r ${getAvatarColor(index)} rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-gray-800`}
                >
                  {getInitials(person.name)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
                <p className="text-gray-600 mb-4">{person.role}</p>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">专长领域</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(person.specialties || []).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span>经验:</span>
                    <span className="font-medium">{person.experience_years || 0} 年</span>
                  </div>
                  <div className="flex justify-between">
                    <span>状态:</span>
                    <span className={`font-medium ${(person.is_active ?? true) ? 'text-green-600' : 'text-gray-500'}`}>
                      {(person.is_active ?? true) ? '在职' : '离职'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    className="px-4 py-2 bg-[#faf8f5] text-[#a88a5c] font-medium rounded-lg hover:bg-[#faf8f5] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setEditingStaff(person)}
                    disabled={submitting}
                  >
                    编辑
                  </button>
                  <button
                    className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleDeleteStaff(person.id)}
                    disabled={deletingId === person.id}
                  >
                    {deletingId === person.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-[#e8d5b8] rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">团队总览</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2"></div>
                <div className="text-3xl font-bold text-gray-900">{staff.length}</div>
                <div className="text-sm text-gray-600">员工总数</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2"></div>
                <div className="text-3xl font-bold text-gray-900">
                  {(staff.reduce((sum, s) => sum + (s.experience_years || 0), 0) / staff.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均经验（年）</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2 font-bold text-[#c9a87c]">ok</div>
                <div className="text-3xl font-bold text-gray-900">
                  {staff.filter(s => s.is_active ?? true).length}
                </div>
                <div className="text-sm text-gray-600">在职员工</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#c9a87c] shadow-sm">
                <div className="text-2xl mb-2"></div>
                <div className="text-3xl font-bold text-gray-900">
                  {Array.from(new Set(staff.flatMap(s => s.specialties))).length}
                </div>
                <div className="text-sm text-gray-600">专长技能数</div>
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