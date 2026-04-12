'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PaymentSettings {
  wechatQr: string;
  alipayQr: string;
  merchantName: string;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<'wechat' | 'alipay' | null>(null);

  useEffect(() => {
    fetch('/api/payment-settings')
      .then(r => r.json())
      .then(data => {
        setSettings({ wechatQr: data.wechatQr || '', alipayQr: data.alipayQr || '', merchantName: data.merchantName || '丽姿秀' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const uploadQr = async (type: 'wechat' | 'alipay', file: File) => {
    setUploading(type);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const name = `${type}_qr_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('payment-qr').upload(name, file, { upsert: true });
      if (error) { alert(`上传失败: ${error.message}`); return; }
      const { data: urlData } = supabase.storage.from('payment-qr').getPublicUrl(name);
      const key = type === 'wechat' ? 'wechatQr' : 'alipayQr';
      setSettings(s => ({ ...s, [key]: urlData.publicUrl }));
    } catch (e: any) { alert(`上传失败: ${e.message}`); }
    finally { setUploading(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('保存失败');
      }
    } catch (e) { alert('保存失败'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-pink-600 transition">← 后台</Link>
        <h1 className="text-3xl font-bold text-gray-900">💳 收款码设置</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          💡 上传的收款码将在客户结算时展示，请确保二维码清晰可扫、可正常收款。
        </div>

        {/* 商家名称 */}
        <div className="mb-8">
          <label className="block text-gray-800 font-bold mb-2">商家名称</label>
          <input
            type="text"
            value={settings.merchantName}
            onChange={e => setSettings(s => ({ ...s, merchantName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="显示在收款页面"
          />
        </div>

        {/* 微信收款码 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💚</span>
            <label className="text-gray-800 font-bold text-lg">微信收款码</label>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50">
            {settings.wechatQr ? (
              <div className="relative inline-block">
                <img src={settings.wechatQr} alt="微信收款码" className="max-w-xs mx-auto rounded-xl shadow-md" style={{ maxHeight: '300px' }} />
                <button onClick={() => setSettings(s => ({ ...s, wechatQr: '' }))}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition shadow-lg">
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">💚</div>
                <p className="text-gray-500 mb-4">点击下方按钮上传微信收款码</p>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition ${uploading === 'wechat' ? 'opacity-50' : ''}`}>
              {uploading === 'wechat' ? '上传中...' : '📤 上传微信收款码'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadQr('wechat', f); }}
              />
            </label>
          </div>
        </div>

        {/* 支付宝收款码 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💙</span>
            <label className="text-gray-800 font-bold text-lg">支付宝收款码</label>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50">
            {settings.alipayQr ? (
              <div className="relative inline-block">
                <img src={settings.alipayQr} alt="支付宝收款码" className="max-w-xs mx-auto rounded-xl shadow-md" style={{ maxHeight: '300px' }} />
                <button onClick={() => setSettings(s => ({ ...s, alipayQr: '' }))}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition shadow-lg">
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">💙</div>
                <p className="text-gray-500 mb-4">点击下方按钮上传支付宝收款码</p>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition ${uploading === 'alipay' ? 'opacity-50' : ''}`}>
              {uploading === 'alipay' ? '上传中...' : '📤 上传支付宝收款码'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadQr('alipay', f); }}
              />
            </label>
          </div>
        </div>

        {/* 保存 */}
        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={saving}
            className="px-10 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition disabled:opacity-50">
            {saving ? '保存中...' : '💾 保存设置'}
          </button>
          {saved && <span className="text-green-600 font-bold">✅ 保存成功！</span>}
        </div>
      </div>

      {/* 预览 */}
      {(settings.wechatQr || settings.alipayQr) && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">👁️ 客户看到的效果预览</h2>
          <div className="grid grid-cols-2 gap-6">
            {settings.wechatQr && (
              <div className="text-center">
                <img src={settings.wechatQr} alt="预览" className="max-w-xs mx-auto rounded-xl shadow-md mb-2" />
                <p className="font-bold text-green-600">💚 微信支付</p>
              </div>
            )}
            {settings.alipayQr && (
              <div className="text-center">
                <img src={settings.alipayQr} alt="预览" className="max-w-xs mx-auto rounded-xl shadow-md mb-2" />
                <p className="font-bold text-blue-600">💙 支付宝</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
