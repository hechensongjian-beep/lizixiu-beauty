'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getServices } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  popularity: number;
  is_active: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  return `${minutes}分钟`;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getServices()
      .then(data => {
        if (data?.error) throw new Error(data.error);
        setServices(data?.services || []);
      })
      .catch(err => setError(err?.message || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const activeServices = services.filter((s: any) => s.is_active !== false);
  const categories = ['全部', ...Array.from(new Set(activeServices.map(s => s.category || '其他')))];
  const filtered = activeServices.filter(s => {
    const matchCat = !filter || s.category === filter;
    const matchSearch = !search || s.name.includes(search) || (s.description || '').includes(search);
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-10 w-48 rounded-lg animate-pulse bg-gray-200 mb-8 mx-auto"></div>
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div><div className="h-4 bg-gray-100 rounded w-full mb-2"></div><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>)}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 页面顶部 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{background:'linear-gradient(135deg, #c9a87c22 0%, #e8d5b822 100%)'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{fontFamily:"'Noto Serif SC',serif"}}>服务项目</h1>
        <p className="text-gray-500">专业美容服务，预约即刻享受</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b9b98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="搜索服务..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 text-sm outline-none transition"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'white',color:'#2a2a28'}}
            onFocus={e => (e.target.style.borderColor = '#c9a87c')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,124,0.3)')}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'#9b9b98'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat === '全部' ? '' : cat)}
            className="px-5 py-2.5 rounded-full font-medium transition"
            style={(!filter && cat === '全部') || filter === cat
              ? {background:'linear-gradient(135deg, #c9a87c, #b8956a)',color:'white',boxShadow:'0 2px 8px rgba(201,168,124,0.3)',fontSize:'1rem'}
              : {background:'white',border:'1.5px solid #e8e4df',color:'#6b6b68',fontSize:'1rem'}}>
            {cat}
          </button>
        ))}
      </div>

      {/* 服务列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{color:'#9b9b98'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-xl mb-2">{(search || filter) ? '未找到相关服务' : '暂无服务项目'}</p>
          <p className="text-sm">{(search || filter) ? '试试其他关键词或分类' : '商家正在准备中，敬请期待'}</p>
          {(search || filter) && (
            <button onClick={() => { setSearch(''); setFilter(''); }} className="mt-4 px-6 py-2 rounded-lg text-sm font-medium text-white" style={{background:'var(--primary)'}}>
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 mb-16">
          {filtered.map(service => (
            <div key={service.id}
              className="bg-white rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{border:'1px solid rgba(201,168,124,0.15)',boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}
              onClick={() => setSelectedService(service)}>
              <div className="flex items-start gap-4">
                {/* 头像 */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg, #c9a87c, #e8d5b8)'}}>
                  {service.name?.charAt(0) || 'S'}
                </div>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-xl" style={{color:'#2a2a28'}}>{service.name}</h3>
                        {service.category && (
                          <span className="text-sm px-2.5 py-1 rounded-full" style={{background:'rgba(201,168,124,0.1)',color:'#a88a5c'}}>{service.category}</span>
                        )}
                        {service.popularity && service.popularity > 80 && (
                          <span className="text-sm px-2.5 py-1 rounded-full bg-red-50 text-red-500 font-medium">热门</span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-base text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm" style={{color:'#9b9b98'}}>
                        {service.duration > 0 && <span>⏱ {formatDuration(service.duration)}</span>}
                        {service.popularity && <span>{service.popularity} 热度</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold" style={{color:'#a88a5c'}}>{formatCurrency(service.price)}</div>
                      <div className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white inline-block" style={{background:'var(--primary)'}}>查看详情</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 服务详情弹窗 */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            style={{maxHeight:'85vh',overflowY:'auto',border:'1px solid rgba(201,168,124,0.2)'}}
            onClick={e => e.stopPropagation()}>
            {/* 关闭 */}
            <button onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {/* 头像 */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-5"
              style={{background:'linear-gradient(135deg, #c9a87c, #e8d5b8)'}}>
              {selectedService.name?.charAt(0) || 'S'}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>{selectedService.name}</h2>
            {selectedService.category && (
              <span className="text-xs px-2.5 py-1 rounded-full inline-block mb-4" style={{background:'rgba(201,168,124,0.1)',color:'#a88a5c'}}>{selectedService.category}</span>
            )}
            {selectedService.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{selectedService.description}</p>
            )}
            <div className="flex items-center gap-6 mb-6">
              {selectedService.duration > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDuration(selectedService.duration)}
                </div>
              )}
              {selectedService.popularity && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {selectedService.popularity} 热度
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-5 border-t" style={{borderColor:'rgba(201,168,124,0.15)'}}>
              <div>
                <div className="text-xs text-gray-400 mb-1">服务价格</div>
                <div className="text-2xl font-bold" style={{color:'#a88a5c'}}>{formatCurrency(selectedService.price)}</div>
              </div>
              <Link href={`/appointments?service=${selectedService.id}`}
                onClick={() => setSelectedService(null)}
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
                style={{background:'linear-gradient(135deg, #c9a87c, #b8956a)',boxShadow:'0 4px 15px rgba(201,168,124,0.35)'}}>
                立即预约
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
