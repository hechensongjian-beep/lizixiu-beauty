'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getServices } from '@/lib/api';

interface Service {
  id: string; name: string; category: string; duration: number; price: number;
  description: string; popularity: number; is_active: boolean;
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
    document.title = '美容服务项目 - 丽姿秀';
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-7 w-40 bg-gray-100 rounded-lg mb-8 mx-auto animate-pulse"></div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid var(--primary-light)' }}><div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div><div className="h-3 bg-gray-50 rounded w-full mb-2"></div><div className="h-3 bg-gray-50 rounded w-1/2"></div></div>)}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p style={{ color: '#ef4444', fontSize: '0.9375rem' }}>{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 页面头部 */}
      <div className="text-center mb-10">
        <div className="tracking-widest mb-2 uppercase" style={{ color: 'var(--primary)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Services</div>
        <h1 style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '1.75rem' }}>专业美容服务</h1>
      </div>

      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative max-w-sm mx-auto">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="搜索服务..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition"
            style={{ borderColor: 'var(--primary-light)', background: 'white', color: 'var(--foreground)', fontSize: '0.8125rem' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--primary-light)')} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-light)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat === '全部' ? '' : cat)}
            className="px-4 py-1.5 rounded-full font-medium transition"
            style={(!filter && cat === '全部') || filter === cat
              ? { background: 'var(--primary)', color: 'white', fontSize: '0.8125rem', boxShadow: '0 2px 8px rgba(201,168,124,0.25)' }
              : { background: 'white', border: '1px solid var(--primary-light)', color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* 服务列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 opacity-30">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="mb-1" style={{ fontSize: '0.9375rem' }}>{(search || filter) ? '未找到相关服务' : '暂无服务项目'}</p>
          <p style={{ fontSize: '0.8125rem' }}>{(search || filter) ? '试试其他关键词或分类' : '商家正在准备中，敬请期待'}</p>
          {(search || filter) && (
            <button onClick={() => { setSearch(''); setFilter(''); }} className="mt-3 px-4 py-1.5 rounded-md text-white" style={{ background: 'var(--primary)', fontSize: '0.8125rem' }}>清除筛选</button>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-16">
          {filtered.map(service => (
            <div key={service.id}
              className="bg-white rounded-xl p-5 cursor-pointer transition-all hover:shadow-md"
              style={{ border: '1px solid var(--primary-light)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
              onClick={() => setSelectedService(service)}>
              <div className="flex items-center gap-4">
                {/* 图标 */}
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', fontSize: '1rem' }}>
                  {service.name?.charAt(0) || 'S'}
                </div>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold" style={{ color: 'var(--foreground)', fontSize: '0.9375rem' }}>{service.name}</h3>
                    {service.category && (
                      <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.6875rem' }}>{service.category}</span>
                    )}
                    {service.popularity && service.popularity > 80 && (
                      <span className="px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#e05c5c', fontSize: '0.6875rem' }}>热门</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="line-clamp-1 mb-1" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>{service.description}</p>
                  )}
                  <div className="flex items-center gap-3" style={{ color: 'var(--foreground-light)', fontSize: '0.6875rem' }}>
                    {service.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatDuration(service.duration)}
                      </span>
                    )}
                  </div>
                </div>
                {/* 价格+操作 */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.0625rem' }}>{formatCurrency(service.price)}</div>
                  <div className="mt-1.5 px-3 py-1 rounded-md text-white inline-block" style={{ background: 'var(--primary)', fontSize: '0.6875rem' }}>查看详情</div>
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
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            style={{ maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--primary-light)' }}
            onClick={e => e.stopPropagation()}>
            {/* 关闭 */}
            <button onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition" style={{ color: 'var(--foreground-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {/* 图标 */}
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', fontSize: '1.25rem' }}>
              {selectedService.name?.charAt(0) || 'S'}
            </div>
            <h2 className="font-bold mb-1.5" style={{ fontFamily: "'Noto Serif SC', serif", color: 'var(--foreground)', fontSize: '1.25rem' }}>{selectedService.name}</h2>
            {selectedService.category && (
              <span className="px-2 py-0.5 rounded-full inline-block mb-3" style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary-dark)', fontSize: '0.6875rem' }}>{selectedService.category}</span>
            )}
            {selectedService.description && (
              <p className="leading-relaxed mb-5" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{selectedService.description}</p>
            )}
            <div className="flex items-center gap-4 mb-5">
              {selectedService.duration > 0 && (
                <div className="flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDuration(selectedService.duration)}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--primary-light)' }}>
              <div>
                <div className="mb-0.5" style={{ color: 'var(--foreground-light)', fontSize: '0.6875rem' }}>服务价格</div>
                <div className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{formatCurrency(selectedService.price)}</div>
              </div>
              <Link href={`/appointments?service=${selectedService.id}`}
                onClick={() => setSelectedService(null)}
                className="px-6 py-2.5 rounded-md text-white font-medium transition"
                style={{ background: 'var(--primary)', fontSize: '0.8125rem', boxShadow: '0 2px 10px rgba(201,168,124,0.25)' }}>
                立即预约
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
