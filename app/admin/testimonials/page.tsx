'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/api';

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  service?: string;
  text: string;
  score: number;
  is_active: boolean;
  sort_order: number;
}

export default async function TestimonialsPage() {
  const { toast } = useToast();
    useEffect(() => { document.title = '口碑管理 - 丽姿秀'; }, []);

const router = useRouter();
  const { role } = useAuth();

  // Permission guard
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c9a87c] border-t-transparent"></div>
      </div>
    );
  }

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', avatar: '', service: '', text: '', score: 5 });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAllTestimonials();
    setTestimonials(res.testimonials || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.text) { toast.info('请填写姓名和评价内容'); return; }
    setSubmitting(true);
    const res = await createTestimonial(form);
    if (res.error) toast.error('添加失败: ' + res.error);
    else { setTestimonials(prev => [...prev, res.testimonial]); setShowAdd(false); setForm({ name: '', avatar: '', service: '', text: '', score: 5 }); }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSubmitting(true);
    const res = await updateTestimonial(editing.id, editing);
    if (res.error) toast.error('更新失败: ' + res.error);
    else { setTestimonials(prev => prev.map(t => t.id === editing.id ? res.testimonial : t)); setEditing(null); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!await toast.confirm('确定删除此评价？')) return;
    const res = await deleteTestimonial(id);
    if (res.error) toast.error('删除失败: ' + res.error);
    else setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">口碑评价管理</h1>
          <p className="text-gray-600">管理首页展示的用户评价</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">刷新</button>
          <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-[#2d4a3e] text-white font-semibold rounded-lg">+ 添加评价</button>
        </div>
      </div>

      {/* 添加表单 */}
      {showAdd && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">添加新评价</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="客户姓名 *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-3 border rounded-lg" />
            <input placeholder="头像字符（如：王）" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} className="px-4 py-3 border rounded-lg" />
            <input placeholder="服务项目" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className="px-4 py-3 border rounded-lg" />
            <select value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })} className="px-4 py-3 border rounded-lg">
              {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} 星</option>)}
            </select>
            <textarea placeholder="评价内容 *" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="px-4 py-3 border rounded-lg md:col-span-2" rows={3} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-gray-100 rounded-lg">取消</button>
            <button onClick={handleAdd} disabled={submitting} className="px-6 py-2 bg-[#2d4a3e] text-white rounded-lg disabled:opacity-50">{submitting ? '提交中...' : '确认添加'}</button>
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">编辑评价</h2>
            <div className="space-y-4">
              <input placeholder="客户姓名" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
              <input placeholder="头像字符" value={editing.avatar || ''} onChange={e => setEditing({ ...editing, avatar: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
              <input placeholder="服务项目" value={editing.service || ''} onChange={e => setEditing({ ...editing, service: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
              <select value={editing.score} onChange={e => setEditing({ ...editing, score: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg">
                {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} 星</option>)}
              </select>
              <textarea placeholder="评价内容" value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} className="w-full px-4 py-3 border rounded-lg" rows={3} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                显示在首页
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="px-6 py-2 bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleUpdate} disabled={submitting} className="px-6 py-2 bg-[#2d4a3e] text-white rounded-lg disabled:opacity-50">{submitting ? '更新中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">暂无评价数据</p>
          <p className="text-sm text-gray-400">请先在 Supabase Dashboard 创建 testimonials 表</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c9a87c] to-[#b8956a] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {t.avatar || t.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{t.name}</span>
                  {t.service && <span className="text-sm text-gray-500">· {t.service}</span>}
                  <span className="flex gap-0.5 ml-2">
                    {Array.from({ length: t.score }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </span>
                  {!t.is_active && <span className="text-sm text-red-500 ml-2">(已隐藏)</span>}
                </div>
                <p className="text-gray-700 text-sm">{t.text}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(t)} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">编辑</button>
                <button onClick={() => handleDelete(t.id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-[#c9a87c]">← 返回仪表板</Link>
      </div>
    </div>
  );
}
