'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('https://czvmhylvatlegobrxyrx.supabase.co/rest/v1/site_settings?id=eq.1&select=*', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dm1oeWx2YXRsZWdvYnJ5cngiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0OTM1MjQwMCwiZXhwIjoxOTY0OTI4NDAwfQ.T9W0RRlxyNOHmHsq3zqrGNz6lIz3G6xK7bUJ6YymUBs',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dm1oeWx2YXRsZWdvYnJ5cngiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0OTM1MjQwMCwiZXhwIjoxOTY0OTI4NDAwfQ.T9W0RRlxyNOHmHsq3zqrGNz6lIz3G6xK7bUJ6YymUBs',
      },
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data[0]) setSettings(data[0]);
    }).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-[var(--primary-light)]/30 bg-[var(--background-secondary)] py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{(settings as any)?.merchant_name || '丽姿秀美容工作室'}</p>
        {(settings as any)?.business_hours ? (
          <p className="text-xs text-[var(--foreground-muted)]">{(settings as any).business_hours}</p>
        ) : null}
        {(settings as any)?.tel ? (
          <p className="text-xs text-[var(--foreground-muted)]">{(settings as any).tel}</p>
        ) : null}
        {(settings as any)?.addr ? (
          <p className="text-xs text-[var(--foreground-muted)]">{(settings as any).addr}</p>
        ) : null}
        <p className="text-xs text-[var(--foreground-muted)] pt-1">
          © {new Date().getFullYear()} {(settings as any)?.merchant_name || '丽姿秀'} · 保留所有权利
        </p>
      </div>
    </footer>
  );
}
