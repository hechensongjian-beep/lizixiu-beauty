'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';

interface Product {
  id: string; name: string; description: string; price: number;
  originalPrice?: number; category: string; stock: number;
  imageColor: string; imageUrl?: string; tags?: string[];
}

const IMAGE_COLORS = [
  'from-[#e8d5b8] to-[#c9a87c]','from-blue-200 to-cyan-300',
  'from-amber-200 to-orange-300','from-purple-200 to-violet-300',
  'from-green-200 to-emerald-300','from-red-200 to-[#e8d5b8]',
];

export default function AdminProductsPage() {
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
      const ext = file.name.split('.').pop();
      const name = `product_${Date.now()}.${ext}`;
      const { data, error } = await supabaseAdmin.storage.from('product-images').upload(name, file, { upsert: true });
      if (error) { console.error('上传失败:', error); return null; }
      const { data: urlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(name);
      return urlData.publicUrl;
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

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, imageColor: p.imageColor || IMAGE_COLORS[0], imageUrl: p.imageUrl || '' });
    setTab('add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { alert('请填写名称、价格和分类'); return; }
    try {
      const result = editing ? await updateProduct(editing.id, form) : await createProduct(form);
      if (result.error) { alert(result.error); }
      else { alert(editing ? '更新成功' : '添加成功'); fetchProducts(); setTab('list'); }
    } catch { alert('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？删除后无法恢复')) return;
    try {
      const result = await deleteProduct(id);
      if (result.success) { alert('删除成功'); fetchProducts(); }
      else { alert(result.error || '删除失败'); }
    } catch { alert('网络错误'); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"> 产品管理</h1>
          <p className="text-gray-500 mt-1">管理商品 · 上传图片 · 更新库存</p>
        </div>
        <button onClick={openAdd} className="px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg">
          ＋ 添加商品
        </button>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setTab('list')} className={`px-5 py-2 rounded-full font-medium transition ${tab==='list'?'bg-[#c9a87c] text-white shadow':'bg-white border text-gray-700 hover:bg-gray-50'}`}>商品列表</button>
        <button onClick={() => { openAdd(); setTab('add'); }} className={`px-5 py-2 rounded-full font-medium transition ${tab==='add'?'bg-[#c9a87c] text-white shadow':'bg-white border text-gray-700 hover:bg-gray-50'}`}>添加/编辑</button>
      </div>

      {/* 添加/编辑表单 */}
      {tab === 'add' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{editing ? '编辑商品' : '添加新商品'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品名称 *</label>
                <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  placeholder="如：玫瑰精油焕肤套装" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
                <input type="text" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                  placeholder="如：面部护理" list="categories" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
                <datalist id="categories">{categories.map(c=><option key={c} value={c}/>)}</datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">价格（元） *</label>
                <input type="number" step="0.01" min="0" value={form.price||''} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">库存数量 *</label>
                <input type="number" min="0" value={form.stock||''} onChange={e=>setForm(f=>({...f,stock:parseInt(e.target.value)||0}))}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  placeholder="详细描述商品特点..." className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a87c]" />
              </div>
              {/* 图片上传 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">商品图片（上传到云存储）</label>
                <div className="flex items-start gap-6">
                  <div className={`w-40 h-40 rounded-xl bg-gradient-to-br ${form.imageColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                    {form.imageUrl ? <img src={form.imageUrl} alt="预览" className="w-full h-full object-cover" /> : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition border">
                      {uploading ? '上传中...' : form.imageUrl ? ' 更换图片' : ' 上传图片'}
                    </button>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(f=>({...f,imageUrl:''}))}
                        className="ml-3 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">移除</button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">支持 JPG、PNG、WebP，自动上传到云存储</p>
                    {uploading && <div className="mt-3 w-full bg-gray-200 rounded-full h-2"><div className="bg-[#c9a87c] h-2 rounded-full animate-pulse" style={{width:'60%'}}></div></div>}
                  </div>
                </div>
                {/* 颜色选择（无图片时作为占位背景） */}
                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-2">背景色（无图片时显示）</label>
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
              <button type="button" onClick={() => setTab('list')} className="px-6 py-3 border rounded-xl font-bold text-gray-700 hover:bg-gray-50">取消</button>
              <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white rounded-xl font-bold hover:opacity-90 shadow">
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
              { label: '商品总数', value: products.length, icon: '', color: 'from-[#c9a87c] to-[#e8d5b8]' },
              { label: '总库存', value: products.reduce((s,p)=>s+p.stock,0), icon: '', color: 'from-[#c9a87c] to-[#e8d5b8]' },
              { label: '分类数', value: categories.length, icon: '', color: 'from-[#c9a87c] to-[#e8d5b8]' },
              { label: '缺货商品', value: products.filter(p=>p.stock===0).length, icon: '', color: 'from-[#c9a87c] to-[#e8d5b8]' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 shadow`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm opacity-80">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 商品表格 */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {loading ? (
              <div className="p-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c9a87c] mx-auto"></div></div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center text-gray-400"><div className="text-5xl mb-4"></div><p className="text-xl">暂无商品，点击右上角添加</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">商品</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">分类</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">价格</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">库存</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.imageColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl text-gray-300">*</span>}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{p.category}</span></td>
                        <td className="py-4 px-6 font-bold text-[#a88a5c]">{fmt(p.price)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-bold ${p.stock===0?'text-red-500':p.stock<=10?'text-yellow-600':'text-green-600'}`}>{p.stock} 件</span>
                          {p.stock===0 && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">缺货</span>}
                          {p.stock>0 && p.stock<=10 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">紧张</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">编辑</button>
                            <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">删除</button>
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
