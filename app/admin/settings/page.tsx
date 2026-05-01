'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
    document.title = '系统设置 - 丽姿秀';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CleanupPolicy {
  enabled: boolean;
  period: '1month' | '6months' | '1year' | 'custom';
  auto_delete: boolean;
  last_cleanup: string | null;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<CleanupPolicy>({
    enabled: false,
    period: '6months',
    auto_delete: false,
    last_cleanup: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    loadPolicy();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || !['admin', 'merchant'].includes(profile.role)) {
      router.push('/');
    }
  };

  const loadPolicy = async () => {
    try {
      const res = await fetch('/api/admin/cleanup');
      const data = await res.json();
      if (data.policy) {
        setPolicy(data.policy);
      }
    } catch (error) {
      console.error('加载策略失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePolicy = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: policy.enabled,
          period: policy.period,
          auto_delete: policy.auto_delete
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '清理策略已保存！' });
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const previewCleanup = async () => {
    setPreviewResult(null);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: policy.period })
      });
      const data = await res.json();
      if (data.preview) {
        setPreviewResult(data);
      } else {
        setMessage({ type: 'error', text: data.error || '预览失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '预览失败' });
    }
  };

  const executeCleanup = async () => {
    if (confirmText !== '我已确认订单信息无误，同意清理') {
      setMessage({ type: 'error', text: '请输入正确的确认文本' });
      return;
    }
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: policy.period,
          confirmed: true,
          confirmation_text: confirmText
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowCleanupConfirm(false);
        setConfirmText('');
        loadPolicy(); // 重新加载策略
      } else {
        setMessage({ type: 'error', text: data.error || '清理失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '清理失败' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-foreground">系统设置</h1>
            <p className="text-foreground-muted mt-1">管理网站性能和数据清理策略</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="btn-primary px-4 py-2 rounded-lg"
          >
            返回控制台
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'rgba(239,68,68,0.1) text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* 订单清理设置 */}
        <div className="bg-background-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-serif text-foreground mb-4">订单自动清理</h2>
          <p className="text-foreground-muted mb-6">
            为避免历史订单积累导致网站变卡，可设置自动清理策略。仅清理已完成或已取消的订单。
          </p>

          {/* 启用开关 */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-foreground">启用自动清理</h3>
              <p className="text-sm text-foreground-muted">定期自动清理历史订单</p>
            </div>
            <button
              onClick={() => setPolicy({ ...policy, enabled: !policy.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                policy.enabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  policy.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 清理周期 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">清理周期</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '1month', label: '1个月前' },
                { value: '6months', label: '6个月前' },
                { value: '1year', label: '1年前' },
                { value: 'custom', label: '自定义', disabled: true }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => !option.disabled && setPolicy({ ...policy, period: option.value as any })}
                  disabled={option.disabled}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    policy.period === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-primary/50 text-foreground-muted'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 自动删除选项 */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-50 rounded-lg">
            <input
              type="checkbox"
              id="auto_delete"
              checked={policy.auto_delete}
              onChange={(e) => setPolicy({ ...policy, auto_delete: e.target.checked })}
              className="mt-1"
            />
            <div>
              <label htmlFor="auto_delete" className="font-medium text-foreground">
                自动执行删除（不推荐）
              </label>
              <p className="text-sm text-foreground-muted mt-1">
                启用后，系统将自动删除订单，不弹窗确认。建议仅在确认订单无误后启用。
              </p>
            </div>
          </div>

          {/* 上次清理时间 */}
          {policy.last_cleanup && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                上次清理时间：{new Date(policy.last_cleanup).toLocaleString('zh-CN')}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={savePolicy}
              disabled={saving}
              className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存策略'}
            </button>
            <button
              onClick={previewCleanup}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              预览清理
            </button>
          </div>
        </div>

        {/* 预览结果 */}
        {previewResult && (
          <div className="bg-background-card rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-serif text-foreground mb-4">清理预览</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-foreground-muted">清理截止日期</span>
                <span className="font-medium text-foreground">
                  {new Date(previewResult.cutoff_date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">将清理订单数</span>
                <span className="font-medium text-rose-600">{previewResult.order_count} 条</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">涉及金额</span>
                <span className="font-medium text-foreground">¥{previewResult.total_amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg mb-4" style={{background:'rgba(251,191,36,0.1)'}}>
              <p className="text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:'0',marginTop:'1px'}}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{color:'var(--primary-dark)'}}>请仔细检查以上订单，确认无误后再执行清理。清理后数据无法恢复！</span>
              </p>
            </div>
            <button
              onClick={() => setShowCleanupConfirm(true)}
              className="btn-danger px-6 py-2 rounded-lg"
            >
              确认清理订单
            </button>
          </div>
        )}

        {/* 清理确认弹窗 */}
        {showCleanupConfirm && (
          <div className="fixed inset-0 rgba(0,0,0,0.5) flex items-center justify-center z-50">
            <div className="bg-background-card rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-serif text-foreground mb-4">最终确认</h3>
              <p className="text-foreground-muted mb-4">
                此操作将永久删除 {previewResult?.order_count} 条订单记录，且无法恢复。请输入以下文字确认：
              </p>
              <p className="font-medium text-foreground mb-4">"我已确认订单信息无误，同意清理"</p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="请输入确认文本"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={executeCleanup}
                  className="btn-danger px-6 py-2 rounded-lg"
                >
                  确认删除
                </button>
                <button
                  onClick={() => {
                    setShowCleanupConfirm(false);
                    setConfirmText('');
                  }}
                  className="btn-secondary px-6 py-2 rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 性能监控提醒 */}
        <div className="bg-background-card rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-serif text-foreground mb-4">性能优化建议</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rgba(59,130,246,0.1) rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900">图片优化</h4>
                <p className="text-sm text-blue-700 mt-1">
                  上传产品图片时，建议使用 WebP 格式，尺寸不超过 1920x1080，单张大小控制在 500KB 以内，可显著提升加载速度。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-green-900">数据库备份</h4>
                <p className="text-sm text-green-700 mt-1">
                  建议定期在 Supabase 后台导出数据库备份（SQL 格式），以防数据丢失。路径：Supabase → Project → Database → Backups
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-900">订单分页</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  系统已启用订单分页查询，每页显示 20 条，避免加载过多订单导致页面卡顿。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
