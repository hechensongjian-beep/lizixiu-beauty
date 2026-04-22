'use client';

import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

const DEFAULT_SETTINGS = {
  hero_title: '丽姿秀 · Beauty',
  hero_subtitle: '让美，从这里开始',
  hero_desc: '专业美容服务团队，为您提供面部护理、身体SPA、美甲美睫等全方位美丽蜕变方案',
  business_hours: '周一至周日 09:00 - 21:00',
  business_tel: '139-0000-0001',
  business_addr: '上海市静安区南京西路1266号',
  notice_bar: '',
};

export default function SiteSettingsPage() {
    useEffect(() => { document.title = '站点设置 - 丽姿秀'; }, []);

const { role, loading } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (role !== 'merchant' && role !== 'admin') return;
    loadSettings();
  }, [role, loading]);

  async function loadSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
        setTableExists(false);
      }
      return;
    }
    if (data) {
      setSettings({
        hero_title: data.hero_title || DEFAULT_SETTINGS.hero_title,
        hero_subtitle: data.hero_subtitle || DEFAULT_SETTINGS.hero_subtitle,
        hero_desc: data.hero_desc || DEFAULT_SETTINGS.hero_desc,
        business_hours: data.business_hours || DEFAULT_SETTINGS.business_hours,
        business_tel: data.business_tel || DEFAULT_SETTINGS.business_tel,
        business_addr: data.business_addr || DEFAULT_SETTINGS.business_addr,
        notice_bar: data.notice_bar || '',
      });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });

      if (error) throw error;
      setMsg({ type: 'success', text: '保存成功！首页已更新。' });
    } catch (err: any) {
      setMsg({ type: 'error', text: '保存失败：' + (err.message || '请先创建 site_settings 表') });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== 'merchant' && role !== 'admin') {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--foreground-muted)] text-lg mb-4">无权限访问</p>
        <Link href="/" className="text-[var(--primary)] hover:underline">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>
          首页内容设置
        </h1>
        <p className="text-[var(--foreground-muted)] mt-2" style={{ fontSize: '1.0625rem' }}>
          商家可自定义首页显示的标题、宣传语、联系方式等信息
        </p>
      </div>

      {!tableExists && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800 text-lg">需要先创建数据表</p>
              <p className="text-amber-700 mt-1" style={{ fontSize: '1rem' }}>
                请在 Supabase Dashboard → <strong>SQL Editor</strong> 执行以下 SQL：
              </p>
              <pre className="mt-3 p-4 bg-white rounded-lg border border-amber-200 text-sm overflow-x-auto"
                style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#92400e' }}>
{`CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text DEFAULT '丽姿秀 · Beauty',
  hero_subtitle text DEFAULT '让美，从这里开始',
  hero_desc text DEFAULT '专业美容服务团队',
  business_hours text DEFAULT '周一至周日 09:00 - 21:00',
  business_tel text DEFAULT '139-0000-0001',
  business_addr text DEFAULT '上海市静安区',
  notice_bar text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY "Allow all" ON site_settings;
CREATE POLICY "Allow all" ON site_settings FOR ALL USING (true);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 首页横幅 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary-light)]/30">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            首页横幅
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">主标题</label>
              <input type="text" value={settings.hero_title}
                onChange={e => setSettings(s => ({ ...s, hero_title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="例如：丽姿秀 · Beauty" />
            </div>
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">副标题</label>
              <input type="text" value={settings.hero_subtitle}
                onChange={e => setSettings(s => ({ ...s, hero_subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="例如：让美，从这里开始" />
            </div>
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">简介描述</label>
              <textarea value={settings.hero_desc} rows={3}
                onChange={e => setSettings(s => ({ ...s, hero_desc: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                placeholder="简要介绍您的美容院" />
            </div>
          </div>
        </div>

        {/* 营业信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary-light)]/30">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            营业信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">营业时间</label>
              <input type="text" value={settings.business_hours}
                onChange={e => setSettings(s => ({ ...s, business_hours: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">联系电话</label>
              <input type="text" value={settings.business_tel}
                onChange={e => setSettings(s => ({ ...s, business_tel: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-2">门店地址</label>
              <input type="text" value={settings.business_addr}
                onChange={e => setSettings(s => ({ ...s, business_addr: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
          </div>
        </div>

        {/* 公告栏 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary-light)]/30">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
            </svg>
            顶部公告栏（可选）
          </h2>
          <div>
            <label className="block font-medium text-[var(--foreground)] mb-2">公告内容</label>
            <input type="text" value={settings.notice_bar}
              onChange={e => setSettings(s => ({ ...s, notice_bar: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="留空则不显示公告，例如：春节期间营业时间调整通知" />
            <p className="text-[var(--foreground-light)] mt-2" style={{ fontSize: '0.9375rem' }}>
              设置后会显示在页面顶部显眼位置
            </p>
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-lg ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)', boxShadow: '0 4px 15px rgba(201,168,124,0.3)' }}>
          {saving ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  );
}
