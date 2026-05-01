'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, var(--primary)22 0%, var(--primary-light)22 100%)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)', fontFamily: "'Noto Serif SC', serif" }}>
        出错了
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
        页面加载时遇到问题，请尝试刷新页面或返回首页。
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
          style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)' }}
        >
          重试
        </button>
        <a
          href="/"
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }}
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
