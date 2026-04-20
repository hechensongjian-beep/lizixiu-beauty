'use client';

import { useState, useEffect } from 'react';
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

  return (
    <footer className="border-t border-[var(--primary-light)]/30 bg-[var(--background-secondary)] py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{settings?.merchant_name || '丽姿秀美容工作室'}</p>
        {settings?.business_hours ? (
          <p className="text-xs text-[var(--foreground-muted)]">{settings.business_hours}</p>
        ) : null}
        {settings?.business_tel ? (
          <p className="text-xs text-[var(--foreground-muted)]">{settings.business_tel}</p>
        ) : null}
        {settings?.business_addr ? (
          <p className="text-xs text-[var(--foreground-muted)]">{settings.business_addr}</p>
        ) : null}
        <p className="text-xs text-[var(--foreground-muted)] pt-1">
          © {new Date().getFullYear()} {settings?.merchant_name || '丽姿秀'} · 保留所有权利
        </p>
      </div>
    </footer>
  );
}
