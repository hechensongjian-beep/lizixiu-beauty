'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getServices } from '@/lib/api';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  imageColor: string;
  imageUrl?: string;
  tags: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  '面部护理': 'bg-cyan-100 text-cyan-800',
  '身体护理': 'bg-green-100 text-green-800',
  '手足护理': 'bg-amber-100 text-amber-800',
  '美发造型': 'bg-purple-100 text-purple-800',
  '美甲美睫': 'bg-pink-100 text-pink-800',
  '其他': 'bg-gray-100 text-gray-800',
};

function ProductDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    import('@/lib/api').then(({ getProducts }) => {
      getProducts().then(data => {
        const list: Product[] = data?.products || [];
        const found = list.find(p => p.id === id) || null;
        setProduct(found);
        if (found) {
          setRelated(list.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [id]);

  useEffect(() => {
    getServices().then(svc => {
      setServices((svc?.services || []).slice(0, 3));
    });
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="rounded-2xl bg-gray-200 animate-pulse" style={{minHeight:'480px'}}></div>
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded-2xl animate-pulse mt-6"></div>
            <div className="h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{background:'#faf8f5'}}>
        <div style={{color:'#c9a87c'}}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mt-6 mb-4" style={{color:'#2a2a28',fontFamily:"'Noto Serif SC',serif"}}>商品不存在</h1>
        <p style={{color:'#6b6b68'}}>该商品可能已下架或链接有误</p>
        <a href="/products" className="mt-8 px-8 py-3 rounded-xl font-bold text-white transition hover:opacity-90" style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)'}}>
          返回产品列表
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background:'#faf8f5'}}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-[#e8d5b8]/50 sticky top-0 z-20" style={{boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/products" className="flex items-center gap-2 font-medium transition hover:opacity-70" style={{color:'#a88a5c'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>产品列表</span>
          </Link>
          <Link href="/cart" className="relative font-medium transition hover:opacity-70" style={{color:'#a88a5c'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* 面包屑 */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{color:'#9b9b98'}}>
          <Link href="/" className="hover:underline">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">产品商城</Link>
          <span>/</span>
          <span style={{color:'#2a2a28'}}>{product.name}</span>
        </div>

        {/* 主内容 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* 左侧图片 */}
          <div>
            <div className={`rounded-2xl overflow-hidden relative ${!product.imageUrl ? 'bg-gradient-to-br from-[#e8d5b8] to-[#c9a87c]' : ''}`} style={{minHeight:'480px'}}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" style={{minHeight:'480px'}} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center" style={{minHeight:'480px'}}>
                  <div className="text-white text-9xl font-bold opacity-80 mb-6" style={{fontFamily:"'Noto Serif SC',serif"}}>{product.name.charAt(0)}</div>
                  <div className="text-white text-lg opacity-80">{product.name}</div>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl px-8 py-3 rounded-xl" style={{background:'rgba(0,0,0,0.4)'}}>已售罄</span>
                </div>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-white text-sm font-bold" style={{background:'#e05c5c'}}>
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* 服务承诺 */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: '正品保障' },
                { icon: 'M1 3h15v13H1zM16 8l4 3-4 3', text: '满500免运费' },
                { icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', text: '7天无理由' },
              ].map(item => (
                <div key={item.text} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white" style={{border:'1px solid rgba(201,168,124,0.15)'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                  <span className="text-xs font-medium" style={{color:'#6b6b68'}}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-800'}`}>
                {product.category}
              </span>
              {product.tags?.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{background:'#faf8f5',color:'#a88a5c'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold mb-3" style={{color:'#2a2a28',fontFamily:"'Noto Serif SC',serif"}}>{product.name}</h1>
            <p className="text-base mb-6 leading-relaxed" style={{color:'#6b6b68'}}>{product.description}</p>

            {/* 价格 */}
            <div className="p-5 rounded-2xl mb-6" style={{background:'linear-gradient(135deg, #c9a87c11 0%, #e8d5b811 100%)',border:'1px solid rgba(201,168,124,0.2)'}}>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold" style={{color:'#a88a5c'}}>{fmt(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg line-through" style={{color:'#9b9b98'}}>{fmt(product.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm" style={{color:'#6b6b68'}}>
                <span>{product.stock > 0 ? `库存 ${product.stock} 件` : '已售罄'}</span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-red-500 font-medium">仅剩 {product.stock} 件</span>
                )}
              </div>
            </div>

            {/* 配送说明 */}
            <div className="text-sm mb-8 space-y-2" style={{color:'#6b6b68'}}>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>快递配送：满 500 元免运费，不足收 15 元</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                <span>到店自取：免费，请提前预约</span>
              </div>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>

        {/* 搭配服务推荐 */}
        {services.length > 0 && (
          <div className="border-t border-[#e8d5b8]/30 pt-10 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full" style={{background:'linear-gradient(180deg, #c9a87c, #e8d5b8)'}}></div>
              <h2 className="text-lg font-bold" style={{color:'#2a2a28',fontFamily:"'Noto Serif SC',serif"}}>搭配服务推荐</h2>
            </div>
            <div className="space-y-3">
              {services.map(svc => (
                <Link key={svc.id} href={`/services?id=${svc.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 group transition hover:shadow-sm"
                  style={{border:'1px solid rgba(201,168,124,0.15)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background:'linear-gradient(135deg, #c9a87c, #e8d5b8)'}}>
                      {svc.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{color:'#2a2a28'}}>{svc.name}</div>
                      {svc.duration && <div className="text-xs" style={{color:'#9b9b98'}}>{svc.duration} 分钟</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{color:'#a88a5c'}}>{fmt(svc.price)}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{background:'#c9a87c'}}>预约</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div className="border-t border-[#e8d5b8]/30 pt-12">
            <h2 className="text-2xl font-bold mb-8" style={{color:'#2a2a28',fontFamily:"'Noto Serif SC',serif"}}>同类推荐</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => (
                <Link key={p.id} href={`/product?id=${p.id}`}
                  className="bg-white rounded-2xl p-5 transition hover:-translate-y-1"
                  style={{border:'1px solid rgba(201,168,124,0.15)',boxShadow:'0 4px 15px rgba(0,0,0,0.04)'}}>
                  <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center ${!p.imageUrl ? 'bg-gradient-to-br from-[#e8d5b8] to-[#c9a87c]' : ''}`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-white text-3xl font-bold opacity-80">{p.name.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-2 truncate" style={{color:'#2a2a28'}}>{p.name}</h3>
                  <div className="font-bold" style={{color:'#a88a5c'}}>{fmt(p.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{background:'#faf8f5'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#c9a87c] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p style={{color:'#9b9b98'}}>加载中...</p>
        </div>
      </div>
    }>
      <ProductDetailInner />
    </Suspense>
  );
}
