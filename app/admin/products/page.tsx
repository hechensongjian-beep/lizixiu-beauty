'use client';

import { useState, useEffect, useRef } from 'react';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';

interface Product {
  id: string; name: string; description: string; price: number;
  originalPrice?: number; category: string; stock: number;
  imageColor: string; imageUrl?: string; tags?: string[];
}

const IMAGE_COLORS = [
  'from-[#e8d5b8] to-[#c9a87c]','from-[#c9a87c] to-[#a88a5c]',
  'from-[#d4c4a8] to-[#b8956a]','from-[#2d4a3e] to-[#4a7c6f]',
  'from-[#f5f0e8] to-[#e8d5b8]','from-[#8b7355] to-[#c9a87c]',
];

export default function AdminProductsPage() {
  const { toast } = useToast();
    useEffect(() => { document.title = '产品管理 - 丽姿秀'; }, []);

const { role } = useAuth();
  const router = useRouter();
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[var(--foreground-muted)]">正在检查权限...</p>
        </div>
      </div>
    );
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: '', stock: 0, imageColor: IMAGE_COLORS[0], imageUrl: '' });
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data?.products || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-images');
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {};
      if (session?.access_token) authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData, headers: authHeaders });
      const result = await res.json();
      if (result.error) { console.error('Upload failed:', result.error); return null; }
      return result.url || result.publicUrl;
    } catch (e) { console.error(e); return null; }
    finally { setUploading(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setForm(f => ({ ...f, imageUrl: url }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: 0, category: '', stock: 0, imageColor: IMAGE_COLORS[0], imageUrl: '' });
    setTab('add');
  };

const openEdit = async (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, imageColor: p.imageColor || IMAGE_COLORS[0], imageUrl: p.imageUrl || '' });
    setTab('add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.info('请填写名称、价格和分类'); return; }
    try {
      const result = editing ? await updateProduct(editing.id, form) : await createProduct(form);
      if (result.error) { toast.error(result.error); }
      else { toast.success(editing ? '更新成功' : '添加成功'); fetchProducts(); setTab('list'); }
    } catch { toast.error('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!await toast.confirm('确定删除？删除后无法恢复')) return;
    try {
      const result = await deleteProduct(id);
      if (result.success) { toast.success('删除成功'); fetchProducts(); }
      else { toast.error(result.error || '删除失败'); }
    } catch { toast.error('网络错误'); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">产品管理</h1>
          <p className="text-[var(--foreground-muted)] mt-1">管理商品 · 上传图片 · 更新库存</p>
        </div>
        <button onClick={openAdd} className="px-6 py-3 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg" style={{background:'var(--accent)'}}>
          ＋ 添加商品
        </button>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setTab('list')} className={`px-5 py-2 rounded-full font-medium transition ${tab==='list'?'bg-[#c9a87c] text-white shadow':'bg-white border var(--foreground) hover:bg-[var(--background-card)]'}`}>商品列表</button>
        <button onClick={() => { openAdd(); setTab('add'); }} className={`px-5 py-2 rounded-full font-medium transition ${tab==='add'?'bg-[#c9a87c] text-white shadow':'bg-white border var(--foreground) hover:bg-[var(--background-card)]'}`}>添加/编辑</button>
      </div>

      {/* 添加/编辑表单 */}
      {tab === 'add' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">{editing ? '编辑商品' : '添加新商品'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>商品名称 *</label>
                <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  placeholder="如：玫瑰精油焕肤套装" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>分类 *</label>
                <input type="text" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                  placeholder="如：面部护理" list="categories" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
                <datalist id="categories">{categories.map(c=><option key={c} value={c}/>)}</datalist>
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>价格（元） *</label>
                <input type="number" step="0.01" min="0" value={form.price||''} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>库存数量 *</label>
                <input type="number" min="0" value={form.stock||''} onChange={e=>setForm(f=>({...f,stock:parseInt(e.target.value)||0}))}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>商品描述</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  placeholder="详细描述商品特点..." className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              {/* 图片上传 */}
              <div className="md:col-span-2">
                <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>商品图片（上传到云存储）</label>
                <div className="flex items-start gap-6">
                  <div className={`w-40 h-40 rounded-xl bg-gradient-to-br ${form.imageColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                    {form.imageUrl ? <img src={form.imageUrl} alt="预览" className="w-full h-full object-cover" /> : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="px-5 py-2.5 text-[var(--background-secondary)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--background-secondary)] transition border">
                      {uploading ? '上传中...' : form.imageUrl ? ' 更换图片' : ' 上传图片'}
                    </button>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(f=>({...f,imageUrl:''}))}
                        className="ml-3 px-3 py-2 rounded-lg text-sm" style={{background:'rgba(177,93,94,0.08)',color:'var(--rose)'}}>移除</button>
                    )}
                    <p className="text-sm text-[var(--foreground-muted)] mt-2">支持 JPG、PNG、WebP，自动上传到云存储</p>
                    {uploading && <div className="mt-3 w-full text-[var(--background-secondary)] rounded-full h-2"><div className="bg-[#c9a87c] h-2 rounded-full animate-pulse" style={{width:'60%'}}></div></div>}
                  </div>
                </div>
                {/* 颜色选择（无图片时作为占位背景） */}
                <div className="mt-4">
                  <label className="block text-sm text-[var(--foreground-muted)] mb-2">背景色（无图片时显示）</label>
                  <div className="flex gap-2 flex-wrap">
                    {IMAGE_COLORS.map((c, i) => (
                      <button key={i} type="button" onClick={() => setForm(f=>({...f,imageColor:c}))}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} border-2 ${form.imageColor===c?'border-[#c9a87c]':'border-transparent'}`}></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t">
              <button type="button" onClick={() => setTab('list')} className="px-6 py-3 border rounded-xl font-bold text-[var(--foreground)] hover:bg-[var(--background-card)]">取消</button>
              <button type="submit" className="px-8 py-3 text-white rounded-xl font-bold hover:opacity-90 shadow" style={{background:'var(--accent)'}}>
                {editing ? ' 保存更改' : '+ 创建商品'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 统计 */}
      {tab === 'list' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '商品总数', value: products.length, color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
              { label: '总库存', value: products.reduce((s,p)=>s+p.stock,0), color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
              { label: '分类数', value: categories.length, color: 'from-[#c9a87c] to-[#e8d5b8]', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
              { label: '缺货商品', value: products.filter(p=>p.stock===0).length, color: 'from-red-400 to-red-500', svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 shadow`}>
                <div className="mb-2">{s.svg}</div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-sm opacity-80">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 商品表格 */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {loading ? (
              <div className="p-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c9a87c] mx-auto"></div></div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center text-[var(--foreground-muted)]"><div className="text-xl mb-4"></div><p className="text-xl">暂无商品，点击右上角添加</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-[var(--background-card)] border-b">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-[var(--foreground)]">商品</th>
                      <th className="text-left py-4 px-6 font-semibold text-[var(--foreground)]">分类</th>
                      <th className="text-left py-4 px-6 font-semibold text-[var(--foreground)]">价格</th>
                      <th className="text-left py-4 px-6 font-semibold text-[var(--foreground)]">库存</th>
                      <th className="text-left py-4 px-6 font-semibold text-[var(--foreground)]">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t hover:bg-[var(--background-card)] transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.imageColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl text-[var(--foreground-light)]">*</span>}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--foreground)]">{p.name}</div>
                              <div className="text-sm text-[var(--foreground-muted)] max-w-xs truncate">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><span className="px-3 py-1 text-[var(--background-secondary)] text-[var(--foreground)] rounded-full text-sm">{p.category}</span></td>
                        <td className="py-4 px-6 font-bold text-[#a88a5c]">{fmt(p.price)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-bold ${p.stock===0?'var(--rose)':p.stock<=10?'text-yellow-600':'var(--sage)'}`}>{p.stock} 件</span>
                          {p.stock===0 && <span className="ml-2 text-sm px-2 py-0.5 rounded-full" style={{background:'rgba(177,93,94,0.12)',color:'var(--rose)'}}>缺货</span>}
                          {p.stock>0 && p.stock<=10 && <span className="ml-2 text-sm rgba(201,168,124,0.2) text-[var(--primary-dark)] px-2 py-0.5 rounded-full">紧张</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="px-3 py-1.5 rgba(201,168,124,0.1) text-[var(--primary-dark)] rounded-lg text-sm font-medium hover:rgba(201,168,124,0.2)">编辑</button>
                            <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rgba(177,93,94,0.08) text-[var(--rose)] rounded-lg text-sm font-medium hover:rgba(177,93,94,0.15)">删除</button>
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
