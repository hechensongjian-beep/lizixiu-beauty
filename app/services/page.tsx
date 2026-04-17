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

  useEffect(() => {
    getServices()
      .then(data => {
        if (data?.error) throw new Error(data.error);
        setServices(data?.services || []);
      })
      .catch((err: any) => setError(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const activeServices = services.filter((s: any) => s.is_active !== false);
  const categories = ['全部', ...Array.from(new Set(activeServices.map(s => s.category || '其他')))];
  const filtered = filter ? activeServices.filter(s => s.category === filter) : activeServices;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 页面头部 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{background:'linear-gradient(135deg, #c9a87c22 0%, #e8d5b822 100%)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>服务项目</h1>
        <p style={{color:'#6b6b68'}}>专业美容服务，预约即刻享受</p>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{border:'1px solid rgba(201,168,124,0.15)'}}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="text-center py-16">
          <p style={{color:'#e05c5c'}}>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-lg text-white text-sm font-bold" style={{background:'#a88a5c'}}>
            重试
          </button>
        </div>
      )}

      {/* 服务列表 */}
      {!loading && !error && (
        <>
          {/* 分类筛选 */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat === '全部' ? '' : cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition"
                style={!filter && cat === '全部' || filter === cat
                  ? {background:'linear-gradient(135deg, #c9a87c, #b8956a)',color:'white',boxShadow:'0 2px 8px rgba(201,168,124,0.3)'}
                  : {background:'white',border:'1.5px solid #e8e4df',color:'#6b6b68'}}>
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{color:'#9b9b98'}}>
              <p className="text-xl mb-4">暂无服务项目</p>
              <p className="text-sm">商家正在准备中，敬请期待</p>
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
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-lg" style={{color:'#2a2a28'}}>{service.name}</h3>
                            {service.popularity >= 4 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{background:'#e05c5c'}}>热门</span>
                            )}
                            {service.category && (
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{background:'#f5f2ed',color:'#6b6b68'}}>{service.category}</span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm line-clamp-2" style={{color:'#9b9b98'}}>{service.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold" style={{color:'#a88a5c'}}>{formatCurrency(service.price)}</div>
                          <div className="text-xs" style={{color:'#9b9b98'}}>/ {formatDuration(service.duration)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 底部操作 */}
                  <div className="mt-4 flex items-center justify-end">
                    <span className="px-4 py-2 rounded-full text-sm font-medium text-white transition hover:opacity-90"
                      style={{background:'linear-gradient(135deg, #c9a87c, #b8956a)',boxShadow:'0 2px 8px rgba(201,168,124,0.3)'}}>
                      查看详情
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 服务详情弹窗 */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedService(null)}></div>
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            style={{maxHeight:'85vh',overflowY:'auto',border:'1px solid rgba(201,168,124,0.2)'}}
            onClick={e => e.stopPropagation()}>
            {/* 关闭按钮 */}
            <button onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* 服务信息 */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-5"
              style={{background:'linear-gradient(135deg, #c9a87c, #e8d5b8)'}}>
              {selectedService.name?.charAt(0) || 'S'}
            </div>

            {selectedService.category && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                selectedService.category === '面部护理' ? 'bg-cyan-100 text-cyan-800' :
                selectedService.category === '身体护理' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedService.category}
              </span>
            )}

            <h2 className="text-2xl font-bold mb-2" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>{selectedService.name}</h2>

            {selectedService.description && (
              <p className="text-sm mb-6 leading-relaxed" style={{color:'#6b6b68'}}>{selectedService.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl p-4 text-center" style={{background:'#faf8f5',border:'1px solid rgba(201,168,124,0.2)'}}>
                <div className="text-lg font-bold" style={{color:'#a88a5c'}}>{formatCurrency(selectedService.price)}</div>
                <div className="text-xs" style={{color:'#9b9b98'}}>价格</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{background:'#faf8f5',border:'1px solid rgba(201,168,124,0.2)'}}>
                <div className="text-lg font-bold" style={{color:'#a88a5c'}}>{formatDuration(selectedService.duration)}</div>
                <div className="text-xs" style={{color:'#9b9b98'}}>时长</div>
              </div>
            </div>

            {/* 立即预约按钮 */}
            <Link href={`/appointments?service=${selectedService.id}`}
              onClick={() => setSelectedService(null)}
              className="block w-full py-3.5 rounded-xl text-white text-center font-bold transition hover:opacity-90"
              style={{background:'linear-gradient(135deg, #c9a87c, #b8956a)',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}}>
              立即预约
            </Link>
          </div>
        </div>
      )}

      {/* 返回 */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center px-6 py-3 font-semibold rounded-lg transition"
          style={{border:'1.5px solid #c9a87c',color:'#a88a5c'}}>
          返回首页
        </Link>
      </div>
    </div>
  );
}
