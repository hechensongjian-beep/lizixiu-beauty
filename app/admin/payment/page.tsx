'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPaymentSettings, savePaymentSettings } from '@/lib/api';

interface PaymentSettings { wechatQr: string; alipayQr: string; merchantName: string; }

function IconBack({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IconCreditCard({ className }: { className?: string }) {
  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function IconUpload({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IconSave({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function IconCheck({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconEye({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function IconX({ className }: { className?: string }) {
  return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<'wechat' | 'alipay' | null>(null);

  useEffect(() => {
    getPaymentSettings()
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
      const { error } = await supabaseAdmin.storage.from('payment-qr').upload(name, file, { upsert: true });
      if (error) { alert(`上传失败: ${error.message}`); return; }
      const { data: urlData } = supabaseAdmin.storage.from('payment-qr').getPublicUrl(name);
      const key = type === 'wechat' ? 'wechatQr' : 'alipayQr';
      setSettings(s => ({ ...s, [key]: urlData.publicUrl }));
    } catch (e: any) { alert(`上传失败: ${e.message}`); }
    finally { setUploading(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePaymentSettings(settings);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('保存失败: ' + (result.error || ''));
      }
    } catch (e) { alert('保存失败'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a87c]"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-[#a88a5c] transition text-sm">
          <IconBack /> 后台
        </Link>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <IconCreditCard />
          <h1 className="text-3xl font-bold text-gray-900">收款码设置</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="rounded-xl p-4 mb-6 text-sm" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.3)'}}>
          <div className="flex items-start gap-2 text-gray-700">
            <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>上传的收款码将在客户结算时展示，请确保二维码清晰可扫、可正常收款。</span>
          </div>
        </div>

        {/* 商家名称 */}
        <div className="mb-8">
          <label className="block text-gray-800 font-bold mb-2">商家名称</label>
          <input
            type="text"
            value={settings.merchantName}
            onChange={e => setSettings(s => ({ ...s, merchantName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="显示在收款页面"
          />
        </div>

        {/* 微信收款码 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{"background":'#e8f5e9'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#2d8a5e"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/></svg>
            </div>
            <label className="text-gray-800 font-bold text-lg">微信收款码</label>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center" style={{"background":'#faf8f5'}}>
            {settings.wechatQr ? (
              <div className="relative inline-block">
                <img src={settings.wechatQr} alt="微信收款码" className="max-w-xs mx-auto rounded-xl shadow-md" style={{ maxHeight: '300px' }} />
                <button onClick={() => setSettings(s => ({ ...s, wechatQr: '' }))}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg">
                  <IconX className="text-white" />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'#e8f5e9'}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#2d8a5e"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/></svg>
                </div>
                <p className="text-gray-500 mb-4">点击下方按钮上传微信收款码</p>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl cursor-pointer transition ${uploading === 'wechat' ? 'opacity-50' : ''}`}
              style={{"background":'linear-gradient(135deg,#2d8a5e 0%,#4caf50 100%)'}}>
              <IconUpload />
              {uploading === 'wechat' ? '上传中...' : '上传微信收款码'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadQr('wechat', f); }} />
            </label>
          </div>
        </div>

        {/* 支付宝收款码 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{"background":'#e3f2fd'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1677ff"><path d="M21.594 9.478c-.042-2.224-2.396-3.47-4.51-3.47-1.148 0-2.275.417-3.135 1.138L12 10.23l-2.006-3.084C9.275 6.425 8.148 6 6.992 6 4.878 6 2.5 7.254 2.5 9.478c0 .217.028.434.076.643C1.643 11.267 0 13.003 0 15.1c0 3.336 4.082 5.706 8.644 5.706 1.176 0 2.305-.17 3.356-.47v-2.074c-.91.318-1.876.484-2.85.476-2.76 0-4.89-1.484-4.89-3.946h8.72c.036-.21.056-.426.056-.646 0-2.32-2.083-4.068-4.44-4.068z"/></svg>
            </div>
            <label className="text-gray-800 font-bold text-lg">支付宝收款码</label>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center" style={{"background":'#faf8f5'}}>
            {settings.alipayQr ? (
              <div className="relative inline-block">
                <img src={settings.alipayQr} alt="支付宝收款码" className="max-w-xs mx-auto rounded-xl shadow-md" style={{ maxHeight: '300px' }} />
                <button onClick={() => setSettings(s => ({ ...s, alipayQr: '' }))}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg">
                  <IconX className="text-white" />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{"background":'#e3f2fd'}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#1677ff"><path d="M21.594 9.478c-.042-2.224-2.396-3.47-4.51-3.47-1.148 0-2.275.417-3.135 1.138L12 10.23l-2.006-3.084C9.275 6.425 8.148 6 6.992 6 4.878 6 2.5 7.254 2.5 9.478c0 .217.028.434.076.643C1.643 11.267 0 13.003 0 15.1c0 3.336 4.082 5.706 8.644 5.706 1.176 0 2.305-.17 3.356-.47v-2.074c-.91.318-1.876.484-2.85.476-2.76 0-4.89-1.484-4.89-3.946h8.72c.036-.21.056-.426.056-.646 0-2.32-2.083-4.068-4.44-4.068z"/></svg>
                </div>
                <p className="text-gray-500 mb-4">点击下方按钮上传支付宝收款码</p>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl cursor-pointer transition ${uploading === 'alipay' ? 'opacity-50' : ''}`}
              style={{"background":'linear-gradient(135deg,#1677ff 0%,#4096ff 100%)'}}>
              <IconUpload />
              {uploading === 'alipay' ? '上传中...' : '上传支付宝收款码'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadQr('alipay', f); }} />
            </label>
          </div>
        </div>

        {/* 保存 */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-10 py-3 text-white font-bold text-lg rounded-xl transition disabled:opacity-50"
            style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}>
            <IconSave />
            {saving ? '保存中...' : '保存设置'}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <IconCheck className="text-green-600" />
              保存成功
            </div>
          )}
        </div>
      </div>

      {/* 预览 */}
      {(settings.wechatQr || settings.alipayQr) && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <IconEye />
            <h2 className="text-xl font-bold text-gray-900">客户看到的效果预览</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {settings.wechatQr && (
              <div className="text-center">
                <img src={settings.wechatQr} alt="预览" className="max-w-xs mx-auto rounded-xl shadow-md mb-2" />
                <div className="flex items-center justify-center gap-2 font-bold" style={{color:'#2d8a5e'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/></svg>
                  微信支付
                </div>
              </div>
            )}
            {settings.alipayQr && (
              <div className="text-center">
                <img src={settings.alipayQr} alt="预览" className="max-w-xs mx-auto rounded-xl shadow-md mb-2" />
                <div className="flex items-center justify-center gap-2 font-bold" style={{color:'#1677ff'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.594 9.478c-.042-2.224-2.396-3.47-4.51-3.47-1.148 0-2.275.417-3.135 1.138L12 10.23l-2.006-3.084C9.275 6.425 8.148 6 6.992 6 4.878 6 2.5 7.254 2.5 9.478c0 .217.028.434.076.643C1.643 11.267 0 13.003 0 15.1c0 3.336 4.082 5.706 8.644 5.706 1.176 0 2.305-.17 3.356-.47v-2.074c-.91.318-1.876.484-2.85.476-2.76 0-4.89-1.484-4.89-3.946h8.72c.036-.21.056-.426.056-.646 0-2.32-2.083-4.068-4.44-4.068z"/></svg>
                  支付宝
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
