'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="relative mb-8">
        <div className="text-[120px] font-bold leading-none" style={{ color: 'var(--primary-light)', fontFamily: "'Noto Serif SC', serif", opacity: 0.3 }}>
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)', backgroundImage: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>
        页面不存在
      </h1>
      <p className="text-sm mb-10 max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
        您访问的页面可能已下架、链接失效或地址有误，请返回首页或使用搜索功能。
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link href="/"
          className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
          style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)' }}>
          返回首页
        </Link>
        <Link href="/products"
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }}>
          浏览产品
        </Link>
      </div>
    </div>
  );
}
