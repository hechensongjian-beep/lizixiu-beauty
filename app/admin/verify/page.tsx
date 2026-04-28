'use client';

import { useState, useEffect, useCallback } from 'react';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { getPaymentVerifications, updatePaymentVerification } from '@/lib/api';

interface Verification {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_channel: string;
  status: string;
  verified_at: string | null;
  merchant_note: string | null;
  created_at: string;
  orders?: {
    id: string;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
  };
}

interface Summary {
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

export default function PaymentVerifyPage() {
  const { toast } = useToast();
    useEffect(() => { document.title = '支付验证 - 丽姿秀'; }, []);

const { role } = useAuth();
  const router = useRouter();
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[var(--foreground-muted)]">正在检查权限...</p>
        </div>
      </div>
    );
  }
    const [verifications, setVerifications] = useState<Verification[]>([]);
  const [summary, setSummary] = useState<Summary>({ pending: 0, approved: 0, rejected: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentVerifications(filter === 'all' ? undefined : filter);
      const verifs = data?.verifications || [];
      setVerifications(verifs);
      setSummary({
        pending: verifs.filter((v: any) => v.status === 'pending').length,
        approved: verifs.filter((v: any) => v.status === 'approved').length,
        rejected: verifs.filter((v: any) => v.status === 'rejected').length,
        totalAmount: verifs.reduce((s: number, v: any) => s + (v.amount || 0), 0),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setNoteModal({ id, action });
    setNote('');
  };

  const confirmAction = async () => {
    if (!noteModal) return;
    setProcessingId(noteModal.id);
    try {
      const newStatus = noteModal.action === 'approve' ? 'approved' : 'rejected';
      const result = await updatePaymentVerification(noteModal.id, {
        status: newStatus,
        merchant_note: note,
        verified_at: new Date().toISOString(),
      });
      if (result.error) throw new Error(result.error);
      setNoteModal(null);
      fetchData();
    } catch (e: any) {
      toast.info(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleString('zh-CN');

  const CHANNEL_EMOJI: Record<string, string> = {
    wechat: '●',
    alipay: '●',
    cash: '●',
  };
  const CHANNEL_LABEL: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '现金',
  };
  const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'rgba(168,138,92,0.15)', text: 'var(--primary-dark)', label: '待核验' },
    approved: { bg: 'rgba(74,117,86,0.15)', text: 'var(--sage)', label: '已通过' },
    rejected: { bg: 'rgba(177,93,94,0.15)', text: 'var(--rose)', label: '已拒绝' },
  };

  const filtered = filter === 'all'
    ? verifications
    : verifications.filter(v => v.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--foreground-muted)] hover:text-[var(--foreground-muted)]">首页</Link>
            <span className="text-[var(--foreground-light)]">/</span>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">支付核验</h1>
          </div>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">客户提交支付凭证后，商家审核确认</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/payment" className="px-4 py-2 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--background-secondary)] transition">
             收款码设置
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--background-secondary)] disabled:opacity-50 transition"
          >
            {loading ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: '待核验', value: summary.pending, bg: '#1a3a2a', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: '已通过', value: summary.approved, bg: '#14532d', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
            { label: '已拒绝', value: summary.rejected, bg: '#7f1d1d', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
            { label: '已确认金额', value: fmt(summary.totalAmount), bg: '#1a3a2a', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
          ].map(item => (
            <div key={item.label} className="text-white rounded-xl p-4 shadow-sm" style={{ backgroundColor: item.bg }}>
              <div className="text-xl mb-1 flex">{item.icon}</div>
              <div className="text-xl font-semibold">{item.value}</div>
              <div className="text-sm opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 筛选 */}
      <div className="flex gap-1 text-[var(--background-secondary)] rounded-xl p-1 mb-6">
        {[
          { key: 'all', label: `全部 (${verifications.length})` },
          { key: 'pending', label: `待核验 (${summary.pending})` },
          { key: 'approved', label: `已通过 (${summary.approved})` },
          { key: 'rejected', label: `已拒绝 (${summary.rejected})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? 'bg-white shadow text-[#a88a5c]'
                : 'var(--foreground-muted) hover:text-[var(--foreground)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 错误 */}
      {error && (
        <div className="rgba(177,93,94,0.06) border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-[var(--rose)] font-medium">{error}</p>
          <p className="text-sm text-[var(--rose)] mt-1">
            请确认已在 Supabase 执行初始化 SQL：
            <code className="rgba(177,93,94,0.15) px-1 rounded text-sm">payment_verifications</code> 表和
            <code className="rgba(177,93,94,0.15) px-1 rounded text-sm">orders.payment_status</code> 字段
          </p>
        </div>
      )}

      {/* 加载 */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 rgba(201,168,124,0.2) border-t-[#c9a87c] rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white border rgba(201,168,124,0.2) rounded-2xl p-16 text-center">
          <div className="w-12 h-12 text-[var(--background-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
          <p className="text-[var(--foreground-muted)] text-lg font-medium">暂无{filter === 'all' ? '' : filter === 'pending' ? '待核验' : filter === 'approved' ? '已通过' : '已拒绝'}记录</p>
          <p className="text-[var(--foreground-muted)] text-sm mt-2">
            {filter === 'pending' ? '客户扫码支付后会在此处显示' : '选择全部查看所有记录'}
          </p>
        </div>
      )}

      {/* 列表 */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(v => {
            const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.pending;
            return (
              <div key={v.id} className="bg-white border rgba(201,168,124,0.2) rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{CHANNEL_EMOJI[v.payment_channel] || ''}</span>
                      <div>
                        <div className="font-bold text-[var(--foreground)] text-lg">
                          {CHANNEL_LABEL[v.payment_channel] || v.payment_channel} 支付
                        </div>
                        <div className="text-sm text-[var(--foreground-muted)]">
                          {v.customer_name || '匿名客户'}
                          {v.customer_phone && <span className="ml-2">{v.customer_phone}</span>}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${sc.bg} ${sc.text} ml-auto`}>
                        {sc.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-[var(--foreground-muted)] mb-1">订单号</div>
                        <div className="font-mono text-sm text-[var(--foreground)]">{v.orders?.order_number || v.order_id?.substring(0, 8)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--foreground-muted)] mb-1">支付金额</div>
                        <div className="font-bold text-xl text-[var(--sage)]">{fmt(v.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--foreground-muted)] mb-1">提交时间</div>
                        <div className="text-sm text-[var(--foreground)]">{fmtDate(v.created_at)}</div>
                      </div>
                      {v.verified_at && (
                        <div>
                          <div className="text-sm text-[var(--foreground-muted)] mb-1">核验时间</div>
                          <div className="text-sm text-[var(--foreground)]">{fmtDate(v.verified_at)}</div>
                        </div>
                      )}
                    </div>

                    {v.merchant_note && (
                      <div className="mt-3 p-3 text-[var(--background-card)] rounded-xl">
                        <div className="text-sm text-[var(--foreground-muted)] mb-1">商家备注</div>
                        <div className="text-sm text-[var(--foreground)]">{v.merchant_note}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                {v.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--background-secondary)]">
                    <button
                      onClick={() => handleAction(v.id, 'approve')}
                      disabled={processingId === v.id}
                      className="flex-1 py-2.5 text-[var(--accent-light)] text-white rounded-xl font-medium hover:rgba(74,117,86,0.2) disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {processingId === v.id ? '处理中..' : '确认收款'}
                    </button>
                    <button
                      onClick={() => handleAction(v.id, 'reject')}
                      disabled={processingId === v.id}
                      className="flex-1 py-2.5 rgba(177,93,94,0.08) text-[var(--rose)] rounded-xl font-medium hover:rgba(177,93,94,0.15) disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 备注弹窗 */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`px-6 py-4 border-b border-[var(--background-secondary)] ${noteModal.action === 'approve' ? 'rgba(74,117,86,0.06)' : 'rgba(177,93,94,0.06)'} rounded-t-2xl`}>
              <h3 className="font-bold text-lg">
                {noteModal.action === 'approve' ? '确认收款' : '拒绝该支付记录'}
              </h3>
            </div>
            <div className="p-6">
              <label className="block font-medium text-[var(--foreground)] mb-2" style={{fontSize:'1rem'}}>
                备注（可选）
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={noteModal.action === 'approve' ? '如：已到账确认' : '如：金额不符/未到账'}
                rows={3}
                className="w-full border rgba(201,168,124,0.2) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a87c] resize-none"
              />
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 text-[var(--background-secondary)] text-[var(--foreground)] rounded-xl font-medium hover:bg-[var(--background-secondary)] transition"
              >
                取消
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 text-white rounded-xl font-medium transition ${
                  noteModal.action === 'approve'
                    ? 'var(--accent-light) hover:rgba(74,117,86,0.2)'
                    : 'var(--accent-light) hover:text-[var(--accent-light)]'
                }`}
              >
                确认{noteModal.action === 'approve' ? '收款' : '拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
