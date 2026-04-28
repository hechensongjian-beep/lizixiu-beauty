'use client';

import { useToast } from '@/components/Toast';
import { useState, useEffect } from 'react';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '@/lib/api';
    document.title = '促销活动管理 - 丽姿秀';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to: 'all' | 'products' | 'services';
  created_at: string;
}

const emptyForm = {
  title: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  start_date: '',
  end_date: '',
  applicable_to: 'all' as 'all' | 'products' | 'services',
};

export default async function PromotionsPage() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dbSetupNeeded, setDbSetupNeeded] = useState(false);
  const [setupSql, setSetupSql] = useState('');

  useEffect(() => {
    loadPromotions();
    checkDb();
  }, []);

  async function checkDb() {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init_promotions' }),
      });
      const data = await res.json();
      if (data.needsSetup) {
        setDbSetupNeeded(true);
        setSetupSql(data.sql);
      }
    } catch {}
  }

  async function loadPromotions() {
    setLoading(true);
    const result = await getAllPromotions();
    setPromotions(result.promotions || []);
    setLoading(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.title || !form.start_date || !form.end_date) {
      setError('请填写标题、开始时间和结束时间');
      return;
    }

    try {
      if (editingId) {
        await updatePromotion(editingId, form);
      } else {
        await createPromotion(form);
      }
      resetForm();
      loadPromotions();
    } catch (err) {
      setError('操作失败，请重试');
    }
  }

  async function handleEdit(promo: Promotion) {
    setForm({
      title: promo.title,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      start_date: promo.start_date.slice(0, 16),
      end_date: promo.end_date.slice(0, 16),
      applicable_to: promo.applicable_to,
    });
    setEditingId(promo.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!await toast.confirm('确定要删除这个促销活动吗？')) return;
    await deletePromotion(id);
    loadPromotions();
  }

  async function toggleActive(promo: Promotion) {
    await updatePromotion(promo.id, { is_active: !promo.is_active });
    loadPromotions();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function isCurrentlyActive(promo: Promotion) {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    return promo.is_active && now >= start && now <= end;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)' }}>
            促销活动管理
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
            创建和管理促销活动，折扣将在结算时自动应用
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 text-white font-medium transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--primary)', fontSize: '0.9375rem', borderRadius: '0.5rem' }}
        >
          + 新建活动
        </button>
      </div>

      {/* 数据库初始化提示 */}
      {dbSetupNeeded && (
        <div className="p-6 rounded-xl mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <h3 className="mb-2" style={{ fontSize: '1rem', fontWeight: 500, color: '#92400e' }}>需要初始化数据库</h3>
          <p style={{ fontSize: '0.9375rem', color: '#92400e', marginBottom: '0.75rem' }}>
            促销活动表尚未创建。请复制以下SQL，到 Supabase 控制台 → SQL Editor 中执行：
          </p>
          <div className="relative">
            <pre className="p-4 rounded-lg overflow-auto text-xs" style={{
              background: '#1a1a1a', color: '#e5e5e5',
              maxHeight: '200px', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {setupSql}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(setupSql); toast.success('SQL已复制'); }}
              className="absolute top-2 right-2 px-3 py-1 rounded text-xs"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#e5e5e5' }}
            >
              复制SQL
            </button>
          </div>
          <button
            onClick={checkDb}
            className="mt-3 px-4 py-1.5 rounded-md text-sm"
            style={{ background: '#d97706', color: 'white' }}
          >
            执行完毕，重新检查
          </button>
        </div>
      )}

      {/* 活动列表 */}
      {loading ? (
        <div className="text-center py-10" style={{ color: 'var(--foreground-muted)' }}>加载中...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--background-secondary)', border: '1px solid var(--primary-light)' }}>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1rem' }}>暂无促销活动</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-5 py-2 text-white"
            style={{ background: 'var(--primary)', fontSize: '0.875rem', borderRadius: '0.5rem' }}
          >
            创建第一个活动
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="p-5 rounded-xl transition-all"
              style={{
                background: isCurrentlyActive(promo) ? 'rgba(201,168,124,0.08)' : 'white',
                border: `1px solid ${isCurrentlyActive(promo) ? 'var(--primary)' : 'var(--primary-light)'}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.125rem', fontWeight: 500, color: 'var(--foreground)' }}>
                      {promo.title}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-md"
                      style={{
                        background: isCurrentlyActive(promo) ? 'var(--primary)' : 'var(--foreground-muted)',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    >
                      {isCurrentlyActive(promo) ? '进行中' : promo.is_active ? '未开始' : '已停用'}
                    </span>
                  </div>
                  {promo.description && (
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {promo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4" style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)' }}>
                    <span>
                      折扣: <strong style={{ color: 'var(--primary)' }}>
                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `¥${promo.discount_value}`}
                      </strong>
                    </span>
                    <span>有效期: {formatDate(promo.start_date)} ~ {formatDate(promo.end_date)}</span>
                    <span>
                      适用: {promo.applicable_to === 'all' ? '全部' : promo.applicable_to === 'products' ? '仅产品' : '仅服务'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(promo)}
                    className="px-3 py-1.5 transition-colors"
                    style={{
                      border: '1px solid var(--primary-light)',
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      color: promo.is_active ? 'var(--accent)' : 'var(--primary)',
                    }}
                  >
                    {promo.is_active ? '停用' : '启用'}
                  </button>
                  <button
                    onClick={() => handleEdit(promo)}
                    className="px-3 py-1.5 transition-colors"
                    style={{ border: '1px solid var(--primary-light)', borderRadius: '0.375rem', fontSize: '0.8125rem', color: 'var(--foreground)' }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="px-3 py-1.5 transition-colors"
                    style={{ border: '1px solid #fecaca', borderRadius: '0.375rem', fontSize: '0.8125rem', color: '#dc2626' }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新建/编辑表单 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-xl p-6" style={{ background: 'var(--background)', border: '1px solid var(--primary-light)' }}>
            <h2 className="mb-5" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.375rem', fontWeight: 400 }}>
              {editingId ? '编辑活动' : '新建促销活动'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>活动标题 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如: 新客首单8折"
                  className="w-full px-3 py-2 rounded-md outline-none transition-colors"
                  style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                />
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>活动描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="简要描述活动内容"
                  rows={2}
                  className="w-full px-3 py-2 rounded-md outline-none"
                  style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>折扣类型</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 rounded-md outline-none"
                    style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                  >
                    <option value="percentage">百分比折扣</option>
                    <option value="fixed">固定金额</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                    {form.discount_type === 'percentage' ? '折扣比例' : '优惠金额'}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    min={form.discount_type === 'percentage' ? 1 : 1}
                    max={form.discount_type === 'percentage' ? 99 : undefined}
                    className="w-full px-3 py-2 rounded-md outline-none"
                    style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>开始时间 *</label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-md outline-none"
                    style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>结束时间 *</label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-md outline-none"
                    style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>适用范围</label>
                <select
                  value={form.applicable_to}
                  onChange={(e) => setForm({ ...form, applicable_to: e.target.value as 'all' | 'products' | 'services' })}
                  className="w-full px-3 py-2 rounded-md outline-none"
                  style={{ border: '1px solid var(--primary-light)', fontSize: '0.9375rem' }}
                >
                  <option value="all">全部（产品+服务）</option>
                  <option value="products">仅产品</option>
                  <option value="services">仅服务</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--primary-light)' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2"
                  style={{ fontSize: '0.9375rem', color: 'var(--foreground-muted)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white"
                  style={{ background: 'var(--primary)', fontSize: '0.9375rem', borderRadius: '0.5rem' }}
                >
                  {editingId ? '保存修改' : '创建活动'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
