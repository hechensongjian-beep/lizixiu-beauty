'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getCustomers } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  membership_level: string;
  total_spent: number;
  last_visit: string;
  notes?: string;
  created_at?: string;
}

const MEMBERSHIP_OPTIONS = ['普通客户', '银卡会员', '金卡会员', '钻石会员'];

const MEMBERSHIP_STYLE: Record<string, string> = {
  '钻石会员': 'bg-purple-100 text-purple-800',
  '金卡会员': 'bg-yellow-100 text-yellow-800',
  '银卡会员': 'bg-gray-200 text-gray-700',
  '普通客户': 'bg-gray-100 text-gray-600',
};

export default function CustomersPage() {
  const router = useRouter();
  const { role } = useAuth();

  // Permission guard - only merchant/admin
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c9a87c] border-t-transparent"></div>
      </div>
    );
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', membership_level: '普通客户', notes: '' });
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const result = await getCustomers();
      if (result?.error) throw new Error(result.error);
      setCustomers(result?.customers || []);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', membership_level: '普通客户', notes: '' });
    setTab('add');
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, membership_level: c.membership_level, notes: c.notes || '' });
    setTab('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { alert('请填写客户姓名'); return; }
    setSaving(true);
    try {
      // 直接用 Supabase REST API（和现有产品管理一样的方式）
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) { alert('数据源不可用，请刷新页面'); return; }

      if (editing) {
        const { error } = await supabase.from('customers').update({
          name: form.name, phone: form.phone, email: form.email,
          membership_level: form.membership_level, notes: form.notes,
        }).eq('id', editing.id);
        if (error) throw error;
        alert('更新成功');
      } else {
        const { error } = await supabase.from('customers').insert({
          name: form.name, phone: form.phone, email: form.email,
          membership_level: form.membership_level, notes: form.notes,
          total_spent: 0, last_visit: new Date().toISOString().split('T')[0],
        });
        if (error) throw error;
        alert('添加成功');
      }
      fetchCustomers();
      setTab('list');
    } catch (err: any) {
      alert('保存失败: ' + (err.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`确定删除客户"${c.name}"吗？`)) return;
    try {
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) { alert('数据源不可用'); return; }
      const { error } = await supabase.from('customers').delete().eq('id', c.id);
      if (error) throw error;
      alert('删除成功');
      fetchCustomers();
    } catch { alert('删除失败'); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '-';

  const filtered = customers.filter(c =>
    !search || c.name.includes(search) || c.phone.includes(search) || c.email.includes(search)
  );

  const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0);
  const active30 = customers.filter(c => {
    if (!c.last_visit) return false;
    const d = new Date(c.last_visit);
    const t = new Date(); t.setDate(t.getDate() - 30);
    return d >= t;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">客户管理</h1>
          <p className="text-gray-500 mt-1">客户档案 · 会员等级 · 消费记录</p>
        </div>
        <button onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg">
          + 添加客户
        </button>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setTab('list')}
          className={`px-5 py-2 rounded-full font-medium transition ${tab==='list'?'bg-[#c9a87c] text-white shadow':'bg-white border text-gray-700 hover:bg-gray-50'}`}>
          客户列表
        </button>
        <button onClick={() => { openAdd(); setTab('add'); }}
          className={`px-5 py-2 rounded-full font-medium transition ${tab==='add'?'bg-[#c9a87c] text-white shadow':'bg-white border text-gray-700 hover:bg-gray-50'}`}>
          添加客户
        </button>
        {tab === 'edit' && (
          <span className="px-5 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">编辑客户</span>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {(tab === 'add' || tab === 'edit') && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{editing ? '编辑客户' : '添加新客户'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="客户姓名" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="手机号码" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="电子邮箱" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会员等级</label>
                <select value={form.membership_level} onChange={e => setForm(f => ({ ...f, membership_level: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]">
                  {MEMBERSHIP_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="客户偏好、过敏史、特殊需求等..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t">
              <button type="button" onClick={() => setTab('list')}
                className="px-6 py-3 border rounded-xl font-bold text-gray-700 hover:bg-gray-50">取消</button>
              <button type="submit" disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white rounded-xl font-bold hover:opacity-90 shadow disabled:opacity-50">
                {saving ? '保存中...' : (editing ? '保存更改' : '确认添加')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 客户列表 */}
      {tab === 'list' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '客户总数', value: customers.length, color: 'from-[#c9a87c] to-[#e8d5b8]' },
              { label: '累计消费', value: fmt(totalSpent), color: 'from-[#c9a87c] to-[#e8d5b8]', small: true },
              { label: '钻石会员', value: customers.filter(c => c.membership_level === '钻石会员').length, color: 'from-purple-400 to-purple-600' },
              { label: '30天活跃', value: active30, color: 'from-green-400 to-green-600' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 shadow`}>
                <div className={`text-3xl font-bold ${s.small ? 'text-base' : ''}`}>{s.value}</div>
                <div className="text-sm opacity-80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 搜索 */}
          <div className="mb-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索客户姓名、电话、邮箱..."
              className="w-full max-w-md px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
          </div>

          {/* 表格 */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {loading ? (
              <div className="p-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c9a87c] mx-auto"></div></div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 mb-4 font-bold text-xl">!</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchCustomers} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200">重试</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <div className="text-5xl mb-4 font-bold text-gray-300">-</div>
                <p className="text-xl">{search ? '未找到匹配的客户' : '暂无客户数据'}</p>
                {!search && (
                  <button onClick={openAdd} className="mt-6 px-8 py-3 bg-[#c9a87c] text-white rounded-xl font-bold hover:opacity-90">
                    + 添加第一个客户
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['姓名', '联系方式', '会员等级', '累计消费', '最近到店', '操作'].map(col => (
                        <th key={col} className="text-left py-4 px-6 font-semibold text-gray-700">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{c.name}</div>
                          {c.notes && <div className="text-xs text-gray-400 max-w-xs truncate">{c.notes}</div>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{c.phone || '-'}</div>
                          <div className="text-xs text-gray-500">{c.email || '-'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${MEMBERSHIP_STYLE[c.membership_level] || 'bg-gray-100 text-gray-600'}`}>
                            {c.membership_level || '普通客户'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#a88a5c]">{fmt(c.total_spent)}</td>
                        <td className="py-4 px-6 text-gray-600 text-sm">{fmtDate(c.last_visit)}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(c)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">编辑</button>
                            <button onClick={() => handleDelete(c)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
