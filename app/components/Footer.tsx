'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();
        if (data) setSettings(data);
      } catch {}
    }
    loadSettings();
  }, []);

  const currentYear = new Date().getFullYear();
  const merchantName = settings?.merchant_name || '丽姿秀';

  return (
    <footer style={{ background: 'var(--background-secondary)', borderTop: '1px solid rgba(201,168,124,0.15)' }}>
      {/* 上部分割线+品牌区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          
          {/* 品牌区 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <svg width="28" height="28" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#c9a87c" strokeWidth="1.5" />
                <text x="50" y="58" textAnchor="middle" fontSize="32" fill="#c9a87c" fontFamily="serif">丽</text>
              </svg>
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '1.25rem', fontWeight: 400, color: 'var(--foreground)' }}>
                {merchantName}
              </span>
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', lineHeight: 1.7, maxWidth: '360px' }}>
              专业美容服务，融合东方养肤智慧与现代美学，为您定制专属美丽方案。
            </p>
          </div>

          {/* 快速链接 */}
          <div className="flex gap-16">
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--primary)' }}>服务</div>
              <div className="space-y-2">
                {[
                  { href: '/services', label: '服务项目' },
                  { href: '/appointments', label: '立即预约' },
                  { href: '/products', label: '护肤产品' },
                ].map(item => (
                  <div key={item.href}>
                    <Link href={item.href}
                      style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', transition: 'color 0.2s' }}
                      className="hover:text-[var(--primary)]">
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--primary)' }}>联系</div>
              <div className="space-y-2">
                {settings?.business_tel ? (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{settings.business_tel}</p>
                ) : null}
                {settings?.business_hours ? (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>{settings.business_hours}</p>
                ) : null}
                {settings?.business_addr ? (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', maxWidth: '200px' }}>{settings.business_addr}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* 社交图标 */}
        <div className="flex items-center gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(201,168,124,0.1)' }}>
          {/* 微信 */}
          <button className="group flex items-center justify-center w-8 h-8 transition-all duration-200 hover:scale-110"
            style={{ border: '1px solid rgba(201,168,124,0.2)', borderRadius: '50%' }}
            title="微信" aria-label="微信">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.691 11.587c-.944 0-1.766.808-1.766 2.11 0 1.304.822 2.11 1.766 2.11 1.47 0 2.485-1.273 2.485-3.046 0-.97-.396-1.81-1.064-2.302-.447-.329-.896-.56-1.421-.714" />
              <path d="M12.063 12.45c-.37.174-.87.296-1.372.296-1.51 0-2.485-1.273-2.485-3.046 0-.97.396-1.81 1.064-2.302.447-.329.896-.56 1.421-.714" />
              <path d="M21.763 15.438c.04-.71.06-1.448.06-2.195 0-5.15-4.14-9.338-9.244-9.338-5.104 0-9.244 4.188-9.244 9.338 0 5.15 4.14 9.338 9.244 9.338 1.13 0 2.2-.17 3.185-.49l.22.15 2.27-1.51-.28-.18c-.81.32-1.68.48-2.58.48" />
              <path d="M17.5 17c1.38 0 2.5-1.12 2.5-2.5S18.88 12 17.5 12s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5" />
            </svg>
          </button>
          {/* 小红书 */}
          <button className="group flex items-center justify-center w-8 h-8 transition-all duration-200 hover:scale-110"
            style={{ border: '1px solid rgba(201,168,124,0.2)', borderRadius: '50%' }}
            title="小红书" aria-label="小红书">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 2h15C19.5 2 20 2.5 20 3v15c0 .5-.5 1-1.5 1h-15c-.5 0-1-.5-1-1V3c0-.5.5-1 1-1z"/>
              <path d="M9 8c0 1 .5 2 2 2s2-1 2-2-.5-2-2-2-2 1-2 2zm5 0c0 1 .5 2 2 2s2-1 2-2-.5-2-2-2-2 1-2 2z"/>
              <path d="M12 13v3" />
            </svg>
          </button>
          {/* 电话 */}
          <button className="group flex items-center justify-center w-8 h-8 transition-all duration-200 hover:scale-110"
            style={{ border: '1px solid rgba(201,168,124,0.2)', borderRadius: '50%' }}
            title="电话" aria-label="拨打电话">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 底部版权 */}
      <div style={{ borderTop: '1px solid rgba(201,168,124,0.08)', background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
            © {currentYear} {merchantName} · 保留所有权利
          </p>
          <p style={{ color: 'var(--foreground-light)', fontSize: '0.6875rem' }}>
            用心服务 · 专注美丽
          </p>
        </div>
      </div>
    </footer>
  );
}