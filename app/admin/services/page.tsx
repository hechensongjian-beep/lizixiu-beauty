'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, createService, updateService, deleteService } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  category?: string;
  pinned?: boolean;
  featured?: boolean;
  image_url?: string;
}

const CATEGORIES = ['面部护理', '身体护理', '美甲', '美睫', '脱毛', '其他'];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: '面部护理', pinned: false, featured: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');


  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await getServices();
      setServices(res?.services || []);
    } catch {}
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) { setMsg('请填写必填项'); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: typeof form.price === 'string' ? parseFloat(form.price) : form.price,
      duration: typeof form.duration === 'string' ? parseInt(form.duration) : form.duration,
      category: form.category,
      pinned: form.pinned,
      featured: form.featured,
    };
    try {
      let res;
      // Use current editId state (set before this call)
      const id = editId;
      if (id) {
        res = await updateService(id, payload);
      } else {
        res = await createService(payload);
      }
      if (res?.error) {
        setMsg('保存失败: ' + res.error);
      } else {
        setMsg(id ? '更新成功！' : '添加成功！');
        setTimeout(() => {
          setMsg(''); setTab('list'); setEditId(null);
          setForm({ name: '', description: '', price: '', duration: '', category: '面部护理', pinned: false, featured: false });
          loadServices();
        }, 1000);
      }
    } catch (e: any) { setMsg('网络错误: ' + e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该项目？')) return;
    try {
      const res = await deleteService(id);
      if (res?.error) { setMsg('删除失败: ' + res.error); }
      else { setMsg('已删除'); loadServices(); }
    } catch { setMsg('删除失败'); }
    setTimeout(() => setMsg(''), 2000);
  };

  const handleToggle = async (id: string, field: 'pinned' | 'featured') => {
    const svc = services.find(s => s.id === id);
    if (!svc) return;
    try {
      await updateService(id, { [field]: !svc[field] });
      loadServices();
    } catch {}
  };

  const startEdit = (svc: Service) => {
    setForm({ name: svc.name, description: svc.description || '', price: String(svc.price), duration: String(svc.duration || 60), category: svc.category || '面部护理', pinned: svc.pinned || false, featured: svc.featured || false });
    setEditId(svc.id);
    setTab('edit');
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  return (
    <div className="min-h-screen" style={{background:'#faf8f5'}}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b" style={{borderColor:'rgba(201,168,124,0.15)'}}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 rounded-lg transition hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-xl font-bold" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>服务项目管理</h1>
          </div>
          <button onClick={() => { setTab('add'); setEditId(null); setForm({ name: '', description: '', price: '', duration: '', category: '面部护理', pinned: false, featured: false }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm transition shadow-sm"
            style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',boxShadow:'0 4px 12px rgba(201,168,124,0.3)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            添加项目
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {msg && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${msg.includes('失败') || msg.includes('错误') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg}
          </div>
        )}

        {tab === 'list' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10" style={{borderBottom:'2px solid #c9a87c'}}></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {services.map(svc => (
                  <div key={svc.id} className="bg-white rounded-2xl overflow-hidden" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)',border:'1px solid rgba(201,168,124,0.12)'}}>
                    {/* 置顶标签 */}
                    {svc.pinned && (
                      <div className="px-4 py-2 text-xs font-bold text-white flex items-center gap-1" style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)'}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        置顶推荐
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {svc.featured && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-green-700" style={{background:'#ecfdf5',border:'1px solid #a7f3d0'}}>人气王</span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#f5f2ed',color:'#6b6b68'}}>{svc.category || '其他'}</span>
                          </div>
                          <h3 className="text-lg font-bold" style={{color:'#2a2a28'}}>{svc.name}</h3>
                          <p className="text-sm mt-1" style={{color:'#6b6b68'}}>{svc.description || '暂无描述'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold" style={{color:'#a88a5c'}}>{fmt(svc.price)}</span>
                          <span className="text-sm ml-1" style={{color:'#9b9b98'}}>/ {svc.duration || 60}分钟</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle(svc.id, 'pinned')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${svc.pinned ? 'text-white' : ''}`}
                          style={svc.pinned ? {background:'#2d4a3e',border:'none'} : {border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                          {svc.pinned ? '取消置顶' : '置顶'}
                        </button>
                        <button onClick={() => handleToggle(svc.id, 'featured')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${svc.featured ? 'text-white' : ''}`}
                          style={svc.featured ? {background:'#dc2626',border:'none'} : {border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                          {svc.featured ? '人气王' : '标人气'}
                        </button>
                        <button onClick={() => startEdit(svc)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold border transition hover:bg-gray-50" style={{border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                          编辑
                        </button>
                        <button onClick={() => handleDelete(svc.id)}
                          className="px-3 py-2 rounded-lg text-xs font-bold border transition hover:bg-red-50 hover:border-red-300 hover:text-red-600" style={{border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(tab === 'add' || tab === 'edit') && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)',border:'1px solid rgba(201,168,124,0.12)'}}>
              <h2 className="text-2xl font-bold mb-6" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>
                {tab === 'edit' ? '编辑服务项目' : '添加新服务项目'}
              </h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>项目名称 *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="例如：深层清洁护理"
                      className="w-full px-4 py-3 rounded-xl outline-none transition" style={{border:'1.5px solid #e8e4df',background:'white'}}
                      onFocus={e => e.target.style.borderColor = '#c9a87c'}
                      onBlur={e => e.target.style.borderColor = '#e8e4df'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>价格 (元) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" step="0.01" placeholder="199"
                      className="w-full px-4 py-3 rounded-xl outline-none transition" style={{border:'1.5px solid #e8e4df',background:'white'}}
                      onFocus={e => e.target.style.borderColor = '#c9a87c'}
                      onBlur={e => e.target.style.borderColor = '#e8e4df'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>服务时长 (分钟) *</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required min="1" placeholder="60"
                      className="w-full px-4 py-3 rounded-xl outline-none transition" style={{border:'1.5px solid #e8e4df',background:'white'}}
                      onFocus={e => e.target.style.borderColor = '#c9a87c'}
                      onBlur={e => e.target.style.borderColor = '#e8e4df'} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>项目分类</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl outline-none transition" style={{border:'1.5px solid #e8e4df',background:'white',color:'#2a2a28'}}
                      onFocus={e => e.target.style.borderColor = '#c9a87c'}
                      onBlur={e => e.target.style.borderColor = '#e8e4df'}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>项目介绍</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="详细介绍..."
                      className="w-full px-4 py-3 rounded-xl outline-none transition resize-none" style={{border:'1.5px solid #e8e4df',background:'white'}}
                      onFocus={e => e.target.style.borderColor = '#c9a87c'}
                      onBlur={e => e.target.style.borderColor = '#e8e4df'} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-3" style={{color:'#2a2a28'}}>特殊标记</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                          className="w-5 h-5 rounded" style={{accentColor:'#c9a87c'}} />
                        <div>
                          <div className="font-bold text-sm" style={{color:'#2a2a28'}}>置顶推荐</div>
                          <div className="text-xs" style={{color:'#9b9b98'}}>在服务列表顶部显示</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                          className="w-5 h-5 rounded" style={{accentColor:'#dc2626'}} />
                        <div>
                          <div className="font-bold text-sm" style={{color:'#2a2a28'}}>人气王标签</div>
                          <div className="text-xs" style={{color:'#9b9b98'}}>显示"人气王"徽章</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setTab('list')}
                    className="flex-1 py-3 rounded-xl font-bold border transition hover:bg-gray-50" style={{border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                    取消
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl font-bold text-white transition shadow-sm"
                    style={{background: saving ? '#c0bdb8' : 'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)', boxShadow: saving ? 'none' : '0 4px 12px rgba(201,168,124,0.3)'}}>
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
